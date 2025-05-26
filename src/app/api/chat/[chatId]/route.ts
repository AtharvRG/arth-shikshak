// src/app/api/chat/[chatId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { Chat } from '@/models/Chat';

// GET handler to fetch messages for a specific chat
export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const userId = new ObjectId(session.user.id);
    const chatId = params.chatId;

    if (!chatId || typeof chatId !== 'string') {
         return NextResponse.json({ message: "Invalid chat ID provided" }, { status: 400 });
    }

    let chatObjectId: ObjectId;
    try {
        chatObjectId = new ObjectId(chatId);
    } catch (e) {
         return NextResponse.json({ message: "Invalid chat ID format" }, { status: 400 });
    }

    const client: MongoClient = await clientPromise;
    const db: Db = client.db();
    const chatsCollection = db.collection<Chat>('chats');

    // Find the chat and verify ownership
    const chat = await chatsCollection.findOne({
      _id: chatObjectId,
      userId: userId // Ensure the user owns this chat
    });

    if (!chat) {
      return NextResponse.json({ message: "Chat not found or access denied" }, { status: 404 });
    }

    // Return the messages array from the chat document
    return NextResponse.json(chat.messages || [], { status: 200 });

  } catch (error) {
    console.error("Fetch Chat Messages Error:", error);
    return NextResponse.json({ message: "Error fetching chat messages." }, { status: 500 });
  }
}

// DELETE handler for removing a specific chat
export async function DELETE(
    req: NextRequest,
    { params }: { params: { chatId: string } }
) {
    try {
        // 1. Authentication & Authorization
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }
        const userId = new ObjectId(session.user.id);
        const chatId = params.chatId;

        // Validate Chat ID
        if (!chatId || typeof chatId !== 'string') {
            return NextResponse.json({ message: "Invalid chat ID" }, { status: 400 });
        }
        let chatObjectId: ObjectId;
        try {
            chatObjectId = new ObjectId(chatId);
        } catch (e) {
            return NextResponse.json({ message: "Invalid chat ID format" }, { status: 400 });
        }

        // 2. Database Operation
        const client: MongoClient = await clientPromise;
        const db: Db = client.db();
        const chatsCollection = db.collection<Chat>('chats');

        // Attempt to delete the chat document, ensuring it belongs to the user
        const deleteResult = await chatsCollection.deleteOne({
            _id: chatObjectId,
            userId: userId // CRITICAL ownership check
        });

        // 3. Handle Result & Respond
        if (deleteResult.deletedCount === 0) {
            // No document matched the filter (not found or wrong user)
            console.log(`Delete failed: Chat ${chatId} not found or user ${userId} not authorized.`);
            return NextResponse.json({ message: "Chat not found or you don't have permission to delete it" }, { status: 404 });
        }

        console.log(`Chat ${chatId} deleted successfully by user ${userId}.`);
        // Respond with success (no content needed in body usually)
        return NextResponse.json({ message: "Chat deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Delete Chat API Error:", error);
        return NextResponse.json({ message: "An error occurred while deleting the chat." }, { status: 500 });
    }
}