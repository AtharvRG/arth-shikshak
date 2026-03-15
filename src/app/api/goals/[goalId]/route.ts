// src/app/api/goals/[goalId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { Goal } from '@/models/Goal';

// --- GET handler (keep as needed, or remove if not used) ---
// export async function GET(...) { ... }

// --- DELETE handler (keep as before) ---
export async function DELETE(req: NextRequest, { params }: { params: { goalId: string } }) {
    try {
        // ... (Auth, Validation, DB Deletion logic) ...
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        const userId = new ObjectId((session.user as any).id);
        let goalObjectId: ObjectId;
        try { goalObjectId = new ObjectId(params.goalId); }
        catch (e) { return NextResponse.json({ message: "Invalid Goal ID format." }, { status: 400 }); }

        const client: MongoClient = await clientPromise;
        const db: Db = client.db();
        const goalsCollection = db.collection<Goal>('goals');

        const deleteResult = await goalsCollection.deleteOne({ _id: goalObjectId, userId: userId });

        if (deleteResult.deletedCount === 0) return NextResponse.json({ message: "Goal not found or permission denied." }, { status: 404 });

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error("API Delete Goal Error:", error);
        return NextResponse.json({ message: "An error occurred while deleting the goal." }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { goalId: string } }
) {
     try {
        // 1. Authentication & Authorization
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        const userId = new ObjectId((session.user as any).id);
        let goalObjectId: ObjectId;
        try { goalObjectId = new ObjectId(params.goalId); }
        catch (e) { return NextResponse.json({ message: "Invalid Goal ID format." }, { status: 400 }); }

        // 2. Parse Request Body
        const body = await req.json();
        const { currentAmount } = body;

        // 3. Validation
        if (currentAmount === undefined || currentAmount === null || currentAmount === '') {
             return NextResponse.json({ message: "Current amount value is required." }, { status: 400 });
        }
        const parsedAmount = Number(currentAmount);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
             return NextResponse.json({ message: "Current amount must be a non-negative number." }, { status: 400 });
        }

        // 4. Database Update
        const client: MongoClient = await clientPromise;
        const db: Db = client.db();
        const goalsCollection = db.collection<Goal>('goals');

        // Update only the currentAmount and updatedAt fields, verifying ownership
        const updateResult = await goalsCollection.updateOne(
            { _id: goalObjectId, userId: userId }, // Filter by goal ID and user ID
            {
                $set: {
                    currentAmount: parsedAmount, // Set the new amount
                    updatedAt: new Date() // Update the modification timestamp
                }
            }
        );

        // 5. Handle Result & Respond
        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ message: "Goal not found or permission denied." }, { status: 404 });
        }
        if (updateResult.modifiedCount === 0) {
            console.log(`Goal ${params.goalId} currentAmount was already ${parsedAmount}.`);
            // Still success, just no change made
        } else {
             console.log(`Goal ${params.goalId} currentAmount updated successfully.`);
        }

        // Return the updated amount (or just success)
        return NextResponse.json({ message: "Progress updated.", currentAmount: parsedAmount }, { status: 200 });

    } catch (error) {
        console.error("Update Goal Progress API Error:", error);
        return NextResponse.json({ message: "An error occurred while updating goal progress." }, { status: 500 });
    }
}