// src/app/api/goals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path as needed
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { Goal } from '@/models/Goal'; // Make sure Goal model exists
import { parseISO, isValid } from 'date-fns'; // For date validation

// GET handler: Fetch all goals for the logged-in user
export async function GET(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const userId = new ObjectId(session.user.id);

    // 2. Database Fetch
    const client: MongoClient = await clientPromise;
    const db: Db = client.db();
    const goalsCollection = db.collection<Goal>('goals');

    const goals = await goalsCollection.find(
        { userId: userId }
    ).sort({ targetDate: 1, createdAt: -1 }).toArray(); // Sort by target date, then newest

    // 3. Serialize and Respond
    // Use JSON stringify/parse for reliable serialization of ObjectId and Date
    const serializedGoals = JSON.parse(JSON.stringify(goals));

    return NextResponse.json(serializedGoals, { status: 200 });

  } catch (error) {
    console.error("API Fetch Goals Error:", error);
    return NextResponse.json({ message: "Error fetching goals." }, { status: 500 });
  }
}

// POST handler: Add a new goal for the logged-in user
export async function POST(req: NextRequest) {
    try {
        // 1. Authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }
        const userId = new ObjectId(session.user.id);

        // 2. Parse Request Body
        const body = await req.json();
        const { title, description, targetAmount, targetDate } = body;

        // 3. Validation
        if (!title || typeof title !== 'string' || !title.trim()) {
            return NextResponse.json({ message: "Goal title is required and must be a non-empty string." }, { status: 400 });
        }
        if (description && typeof description !== 'string') {
             return NextResponse.json({ message: "Description must be a string." }, { status: 400 });
        }

        let parsedTargetAmount: number | undefined = undefined;
        if (targetAmount !== null && targetAmount !== undefined && targetAmount !== '') {
            parsedTargetAmount = Number(targetAmount);
            if (isNaN(parsedTargetAmount) || parsedTargetAmount < 0) {
                return NextResponse.json({ message: "Target amount must be a non-negative number." }, { status: 400 });
            }
        }

        let parsedTargetDate: Date | undefined = undefined;
        if (targetDate) {
             // Expect YYYY-MM-DD format from input type="date"
             parsedTargetDate = parseISO(targetDate);
             if (!isValid(parsedTargetDate)) {
                  return NextResponse.json({ message: "Invalid target date format. Use YYYY-MM-DD." }, { status: 400 });
             }
             // Optional: Check if date is in the past? Depends on requirements.
             // const today = new Date(); today.setHours(0,0,0,0);
             // if (parsedTargetDate < today) { return NextResponse.json({ message: "Target date cannot be in the past." }, { status: 400 }); }
        }


        // 4. Database Operation
        const client: MongoClient = await clientPromise;
        const db: Db = client.db();
        const goalsCollection = db.collection<Goal>('goals');

        // Prepare new goal document
        const newGoal: Omit<Goal, '_id'> = {
            userId: userId,
            title: title.trim(),
            description: description?.trim() || undefined, // Store undefined if empty
            targetAmount: parsedTargetAmount,
            targetDate: parsedTargetDate,
            currentAmount: 0, // Initialize progress
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Insert into database
        const result = await goalsCollection.insertOne(newGoal as Goal);

        if (!result.insertedId) {
            throw new Error("Failed to create new goal in database.");
        }

        // 5. Respond with Created Goal
        // Fetch the newly created goal to return it with the proper _id
        const createdGoal = await goalsCollection.findOne({ _id: result.insertedId });
        if (!createdGoal) {
            // Should not happen if insert succeeded, but good practice
             throw new Error("Failed to retrieve created goal.");
        }

        return NextResponse.json(JSON.parse(JSON.stringify(createdGoal)), { status: 201 });

    } catch (error) {
        console.error("API Create Goal Error:", error);
        return NextResponse.json( { message: error instanceof Error ? error.message : "An error occurred while creating the goal." }, { status: 500 } );
    }
}