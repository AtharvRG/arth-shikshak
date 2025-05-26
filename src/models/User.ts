// src/models/User.ts
import { ObjectId } from 'mongodb'; // Import ObjectId type

// Interface defining the structure of a User document in MongoDB
export interface User {
  _id: ObjectId; // MongoDB's unique identifier
  name?: string | null;
  email?: string | null; // Email is used for login
  emailVerified?: Date | null; // For email verification flow (optional)
  image?: string | null; // Profile picture URL
  password?: string | null; // Password hash (only store the hash!)

  // Onboarding related fields
  onboardingComplete?: boolean; // Flag to check if user finished onboarding
  dob?: Date | null; // Date of Birth
  occupation?: string | null;
  annualSalary?: number | null;
  // Expenses: Store as an array of objects or reference a separate collection
  expenses?: { category: string; amount: number }[] | null;
  // Debts: Store as an array of objects or reference a separate collection
  debts?: { type: string; amount: number; emi?: number }[] | null;
  // Investments: Store as an array of objects or reference a separate collection
  investments?: { type: string; amount: number }[] | null;
  // Goals: Reference a separate collection
  // goals?: ObjectId[] | null;

  // Timestamps (optional but good practice)
  createdAt?: Date;
  updatedAt?: Date;
}

// Note: NextAuth MongoDB adapter automatically creates/manages
// 'accounts', 'sessions', 'verification_tokens' collections.
// We only need to define our 'users' collection structure.