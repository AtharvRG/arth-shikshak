// src/app/api/chat/new/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path if needed
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { Chat, ChatMessage } from '@/models/Chat';

// POST handler for creating a new chat session
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const userId = new ObjectId(session.user.id); // Convert user ID to ObjectId

    // 2. Connect to the database
    const client: MongoClient = await clientPromise;
    const db: Db = client.db(); // Get database instance
    const chatsCollection = db.collection<Chat>('chats');

    // 3. Create initial system message for the new chat
    // This message is for UI display and sets the context.
    // The main SYSTEM_INSTRUCTION in gemini.ts guides the AI's persona.
    const initialSystemMessage: ChatMessage = {
        id: crypto.randomUUID(), // Generate a unique ID for the message
        role: 'system',
        content: 'I am Arth Shikshak, your AI financial assistant. How can I help you with your finances today?',
        createdAt: new Date(),
    };

    // 4. Prepare the new chat document
    const newChatDocument: Omit<Chat, '_id'> = {
      userId: userId,
      title: "New Chat", // Default title, will be updated by Gemini after first few messages
      messages: [initialSystemMessage], // Start with the system message
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 5. Insert the new chat document into the database
    const result = await chatsCollection.insertOne(newChatDocument as Chat);

    // Check if insertion was successful
    if (!result.insertedId) {
      console.error("API Create New Chat: Failed to insert new chat into database.");
      throw new Error("Failed to create new chat session in the database.");
    }

    const newChatId = result.insertedId.toString(); // Get the ID of the newly created chat
    console.log(`API Create New Chat: New chat created for user ${userId} with ID: ${newChatId}`);

    // 6. Respond to the client with the new chat ID
    return NextResponse.json({ chatId: newChatId }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error("API Create New Chat Error:", error);
    // Return a generic error message to the client
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An error occurred while creating the chat." },
      { status: 500 }
    );
  }
}