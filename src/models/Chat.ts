// src/models/Chat.ts
import { ObjectId } from 'mongodb';

// *** ADD 'export' HERE ***
export interface ChatMessage {
  id: string; // Unique ID for the message itself (e.g., crypto.randomUUID())
  role: 'user' | 'model' | 'system';
  content: string;
  createdAt: Date;
  // Optional: Add other metadata like tokens used, etc.
}
// --- End Export Addition ---

export interface Chat {
  _id: ObjectId; // MongoDB document ID
  userId: ObjectId; // Reference to the User who owns this chat
  title: string; // Title of the chat (e.g., "Retirement Planning Q1")
  messages: ChatMessage[]; // Array of messages in the chat - USES THE EXPORTED TYPE
  createdAt: Date;
  updatedAt: Date;
}