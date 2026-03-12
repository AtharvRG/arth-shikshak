// src/app/api/chat/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { Chat } from '@/models/Chat';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const userId = new ObjectId((session.user as any).id);

    const client: MongoClient = await clientPromise;
    const db: Db = client.db();
    const chatsCollection = db.collection<Chat>('chats');

    // Fetch only relevant fields (_id, title), sort by latest updated
    const chatHistory = await chatsCollection.find(
      { userId: userId },
      { projection: { _id: 1, title: 1, updatedAt: 1 } } // Project only needed fields
    ).sort({ updatedAt: -1 }).toArray(); // Sort by most recently updated

    // Map to format expected by frontend (id as string)
    const formattedHistory = chatHistory.map(chat => ({
        id: chat._id.toString(),
        title: chat.title || "Untitled Chat", // Provide default title
        updatedAt: chat.updatedAt
    }));

    return NextResponse.json(formattedHistory, { status: 200 });

  } catch (error) {
    console.error("Fetch Chat History Error:", error);
    return NextResponse.json({ message: "Error fetching chat history." }, { status: 500 });
  }
}