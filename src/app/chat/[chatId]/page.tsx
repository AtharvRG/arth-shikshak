// src/app/chat/[chatId]/page.tsx
import React from 'react';
import { getServerSession } from "next-auth/next"; // Import for server-side session fetching
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Your NextAuth configuration
import clientPromise from '@/lib/mongodb'; // Your MongoDB connection utility
import { Db, MongoClient, ObjectId } from 'mongodb'; // MongoDB types
import { Chat, ChatMessage } from '@/models/Chat'; // Your Chat/Message types
import ChatInterface from '@/components/chat/ChatInterface'; // The client component for interaction
import { redirect } from 'next/navigation'; // Import redirect for unauthenticated users

// --- Server-Side Data Fetching Helper ---
// Fetches messages directly from DB, ensuring user ownership.
async function getChatData(chatId: string, userId: string): Promise<{ messages: ChatMessage[], error?: string, status?: number }> {
    let chatObjectId: ObjectId;
    let userObjectId: ObjectId;

    // Validate IDs before querying
    try {
        chatObjectId = new ObjectId(chatId);
        userObjectId = new ObjectId(userId);
    } catch (e) {
        console.error("Invalid ObjectId format passed to getChatData:", e);
        return { messages: [], error: 'Invalid chat identifier format. Cannot load chat.', status: 400 };
    }

    // Fetch from Database
    try {
        const client: MongoClient = await clientPromise;
        const db: Db = client.db();
        const chatsCollection = db.collection<Chat>('chats');

        // Find the specific chat document, ensuring it belongs to the logged-in user
        const chat = await chatsCollection.findOne({
            _id: chatObjectId,
            userId: userObjectId // Crucial ownership check
        });

        if (!chat) {
            console.log(`Chat not found or access denied for chatId: ${chatId}, userId: ${userId}`);
            return { messages: [], error: 'Chat not found or access denied.', status: 404 };
        }

        // Return the messages array from the found chat document
        return { messages: chat.messages || [] };

    } catch (error) {
        console.error(`Database error fetching chat messages directly for ${chatId}:`, error);
        return { messages: [], error: 'Failed to load chat data due to a server issue.', status: 500 };
    }
}
// --- End Server-Side Data Fetching Helper ---


// Define the props structure expected by Next.js for dynamic routes
interface ChatPageProps {
    params: {
        chatId: string; // The dynamic segment from the URL [chatId]
    };
}

// This page component is a SERVER COMPONENT by default in Next.js App Router
export default async function ChatPage({ params }: ChatPageProps) {
    const { chatId } = params; // Extract the chat ID from the route parameters

    // 1. Get User Session on the Server
    const session = await getServerSession(authOptions);

    // 2. Handle Unauthenticated User - Redirect to Login
    if (!session?.user?.id) {
        const callbackUrl = encodeURIComponent(`/chat/${chatId}`);
        redirect(`/login?callbackUrl=${callbackUrl}`); // Use Next.js redirect function
    }

    // 3. Fetch Chat Data for Authenticated User
    const { messages: initialMessages, error: fetchError, status: errorStatus } = await getChatData(chatId, session.user.id);

    // 4. Handle Fetch Errors by rendering ChatInterface with an error message
    if (fetchError) {
        const errorMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'system',
            content: `Error loading chat: ${fetchError} (Status: ${errorStatus || 'Unknown'})`,
            createdAt: new Date()
        };
        return (
            <ChatInterface
                key={chatId} // Force re-mount if ID changes unexpectedly
                chatId={chatId}
                initialMessages={[errorMessage]}
            />
        );
    }

    // 5. Render the Chat Interface with fetched data
    return (
        <ChatInterface
            key={chatId} // Ensures component re-mounts with new props on navigation
            chatId={chatId}
            initialMessages={initialMessages}
        />
    );
}