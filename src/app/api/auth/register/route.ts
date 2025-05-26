// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import clientPromise from '@/lib/mongodb'; // MongoDB connection
import { Db, MongoClient } from 'mongodb';
import { User as CustomUserType } from '@/models/User'; // User Interface

// POST handler for user registration
export async function POST(req: NextRequest) {
  try {
    const { email, password /*, name */ } = await req.json(); // Extract data from request body

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }
    // Add more validation (e.g., password complexity) as needed

    const client: MongoClient = await clientPromise;
    const db: Db = client.db(); // Get DB instance
    const usersCollection = db.collection<CustomUserType>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 409 } // 409 Conflict
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // Create the new user document
    const newUser: Omit<CustomUserType, '_id'> = { // Use Omit to let MongoDB generate _id
      email: email,
      password: hashedPassword,
      // name: name || null, // Include name if collecting it at signup
      emailVerified: null, // Set emailVerified to null initially
      image: null,
      onboardingComplete: false, // **Initialize onboarding as incomplete**
      createdAt: new Date(),
      updatedAt: new Date(),
      // Initialize other optional fields from your User model as null or default
      dob: null,
      occupation: null,
      annualSalary: null,
      expenses: [],
      debts: [],
      investments: [],
    };

    // Insert the new user into the database
    const result = await usersCollection.insertOne(newUser as CustomUserType); // Assert type

    if (!result.insertedId) {
        throw new Error("Failed to create user account.");
    }

    console.log(`User registered successfully: ${email}, ID: ${result.insertedId}`);

    // Return success response (don't return sensitive data like password hash)
    return NextResponse.json(
      { message: "User registered successfully.", userId: result.insertedId },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error("Registration Error:", error);
    let errorMessage = "An unexpected error occurred during registration.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 } // Internal Server Error
    );
  }
}