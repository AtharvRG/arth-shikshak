// src/app/chat/[chatId]/page.tsx
import React from 'react';
import { getServerSession } from "next-auth/next"; // Import for server-side session fetching
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Your NextAuth configuration
import clientPromise from '@/lib/mongodb'; // Your MongoDB connection utility
import { ObjectId, Db, MongoClient } from 'mongodb'; // MongoDB types
import { Chat, ChatMessage } from '@/models/Chat'; // Your Chat/Message types
import { User as CustomUserType } from '@/models/User'; // Import CustomUserType
import ChatInterface from '@/components/chat/ChatInterface'; // The client component for interaction
import { redirect } from 'next/navigation'; // Import redirect for unauthenticated users

// --- Server-Side Data Fetching Helper ---
// Fetches messages directly from DB, ensuring user ownership.
async function getChatData(chatId: string, userEmail: string): Promise<{ messages: ChatMessage[], error?: string, status?: number }> {
    let chatObjectId: ObjectId;

    // Validate chatId before querying
    try {
        chatObjectId = new ObjectId(chatId);
    } catch (e) {
        console.error("Invalid ObjectId format for chatId in getChatData:", e);
        return { messages: [], error: 'Invalid chat identifier format. Cannot load chat.', status: 400 };
    }

    // Fetch from Database
    try {
        const client: MongoClient = await clientPromise;
        const db: Db = client.db();

        // First, get the user's ObjectId from their email
        const usersCollection = db.collection<CustomUserType>('users');
        const user = await usersCollection.findOne({ email: userEmail });

        if (!user) {
            console.error(`User not found with email: ${userEmail}`);
            return { messages: [], error: 'User not found.', status: 404 };
        }

        const chatsCollection = db.collection<Chat>('chats');

        // Find the specific chat document, ensuring it belongs to the logged-in user's ObjectId
        const chat = await chatsCollection.findOne({
            _id: chatObjectId,
            userId: user._id // Crucial ownership check using the user's ObjectId
        });

        if (!chat) {
            console.log(`Chat not found or access denied for chatId: ${chatId}, userId: ${user._id}`);
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
    if (!session?.user || !session.user.email) {
        const callbackUrl = encodeURIComponent(`/chat/${chatId}`);
        redirect(`/login?callbackUrl=${callbackUrl}`); // Use Next.js redirect function
    }

    // 3. Fetch Chat Data for Authenticated User
    // Pass session.user.email directly as the user identifier
    const { messages: initialMessages, error: fetchError, status: errorStatus } = await getChatData(chatId, session.user.email!); 

    // 4. Handle Fetch Errors by rendering ChatInterface with an empty message array
    // This will suppress the warning message display.
    if (fetchError) {
        console.error(`Displaying empty chat due to fetch error: ${fetchError}`);
        return (
            <ChatInterface
                key={chatId} // Force re-mount if ID changes unexpectedly
                chatId={chatId}
                initialMessages={[]} // Pass an empty array to suppress the warning message
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