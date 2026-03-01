// src/models/Goal.ts
import { ObjectId } from 'mongodb';

export interface Goal {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  description?: string;
  targetAmount?: number;
  targetDate?: Date;
  currentAmount?: number;
  createdAt: Date;
  updatedAt: Date;
  // *** NEW FIELD ***
  aiSuggestions?: string | null; // Store fetched suggestions as Markdown string
}