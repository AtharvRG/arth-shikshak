// src/app/api/chat/[chatId]/message/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path if needed
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { Chat, ChatMessage } from '@/models/Chat';
import { getGeminiResponse, formatMessagesForGemini, generateChatTitle } from '@/lib/gemini'; // Import Gemini helpers

// Interface for the expected request body when sending a message
interface MessageRequestBody {
  message: string; // Content of the user's message
}

// POST handler for sending a message to an existing chat
export async function POST(
    req: NextRequest,
    { params }: { params: { chatId: string } } // Destructure chatId from route parameters
) {
  try {
    // 1. Authentication & Authorization
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.email) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const userId = new ObjectId((session.user as any).id); // User's ObjectId
    const chatId = params.chatId; // Chat ID from URL path

    // Validate Chat ID format
    let chatObjectId: ObjectId;
    try {
        chatObjectId = new ObjectId(chatId);
    } catch (e) {
        console.error("API Send Message: Invalid chat ID format provided - ", chatId);
        return NextResponse.json({ message: "Invalid chat ID format." }, { status: 400 });
    }

    // 2. Get User Message from Request Body
    const body = await req.json() as MessageRequestBody;
    const userMessageContent = body.message?.trim();
    if (!userMessageContent) {
        return NextResponse.json({ message: "Message content cannot be empty." }, { status: 400 });
    }

    // Create the user message object
    const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: userMessageContent,
        createdAt: new Date(),
    };

    // 3. Fetch Existing Chat for Context and Ownership Verification
    const client: MongoClient = await clientPromise;
    const db: Db = client.db();
    const chatsCollection = db.collection<Chat>('chats');

    const existingChat = await chatsCollection.findOne({ _id: chatObjectId, userId: userId });
    if (!existingChat) {
        console.error(`API Send Message: Chat ${chatId} not found for user ${userId} or access denied.`);
        return NextResponse.json({ message: "Chat not found or access denied." }, { status: 404 });
    }
    const currentMessages = existingChat.messages || []; // Existing messages in the chat
    const userMessagesCountInDB = currentMessages.filter(m => m.role === 'user').length;

    // 4. Call Gemini API for AI Response
    const geminiHistory = formatMessagesForGemini(currentMessages); // Format DB messages for Gemini
    const aiResponseContent = await getGeminiResponse(geminiHistory, userMessageContent); // Get AI's response

    // Create the model's message object
    const modelMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        content: aiResponseContent,
        createdAt: new Date(),
    };

    // 5. Dynamic Title Generation (for the first few user messages in a chat)
    let finalTitle = existingChat.title; // Default to existing title
    // userMessagesCountInDB is count *before* adding current userMessage
    if (userMessagesCountInDB < 3) {
        try {
             // Context for title generation:
             // Pass the new user message and the new AI response for the most up-to-date context.
             const firstUserMsgContent = currentMessages.find(m => m.role === 'user')?.content || userMessage.content;
             const firstModelMsgContent = currentMessages.find(m => m.role === 'model')?.content || modelMessage.content; // Use new AI response
             const secondUserMsgContent = (userMessagesCountInDB === 1) ? userMessage.content : (userMessagesCountInDB > 1 ? currentMessages.filter(m => m.role === 'user')[1]?.content : undefined);

             console.log(`API Send Message: Generating title (User Msgs in DB: ${userMessagesCountInDB})...`);
             finalTitle = await generateChatTitle(firstUserMsgContent, firstModelMsgContent, secondUserMsgContent);
        } catch (titleError) {
             console.error("API Send Message: Failed to generate title dynamically, keeping old/default.", titleError);
        }
    }

    // 6. Save User Message, AI Message, and Updated Title/Timestamp to Database
    const updateResult = await chatsCollection.updateOne(
      { _id: chatObjectId, userId: userId }, // Ensure ownership again for the update
      {
        $push: {
          messages: { $each: [userMessage, modelMessage] } // Atomically add both new messages
        },
        $set: {
           updatedAt: new Date(), // Update the last modification time
           title: finalTitle // Set the new or existing title
        }
      }
    );

    if (updateResult.matchedCount === 0) {
       // This should ideally not happen if findOne succeeded earlier
       console.error(`API Send Message: CRITICAL - Failed to find chat ${chatId} for user ${userId} during message update.`);
       return NextResponse.json({ message: "Chat session error during update." }, { status: 500 });
    }
    if (updateResult.modifiedCount === 0) {
       console.warn(`API Send Message: Messages may not have been appended or metadata (title/updatedAt) not updated for chat ${chatId}. Matched: ${updateResult.matchedCount}`);
    }

    // 7. Respond to the Client with the AI's message
    // The client will typically add this to its local state of messages.
    return NextResponse.json(modelMessage, { status: 200 });

  } catch (error) {
    console.error("API Send Message Error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An error occurred while processing your message." },
      { status: 500 }
    );
  }
}