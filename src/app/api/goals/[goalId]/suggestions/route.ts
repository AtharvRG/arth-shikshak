// src/app/api/goals/[goalId]/suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { Goal } from '@/models/Goal';
import { getGeminiResponse } from '@/lib/gemini';
import { format, parseISO, isValid } from 'date-fns';

// Formatting helpers (copy or import if needed)
const formatCurrencyDisplay = (value: any): string => { const num = Number(value); if (isNaN(num) || value === '' || value === null || value === undefined) return 'N/A'; return `₹ ${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`; };
const formatDateDisplay = (value: any): string => { if (!value) return 'N/A'; try { const date = typeof value === 'string' ? new Date(value) : value; if (!isValid(date)) return 'Invalid Date'; return format(date, 'PPP'); } catch { return 'Invalid Date'; } };

// --- POST: Get existing or generate NEW suggestions ---
export async function POST(
    req: NextRequest,
    { params }: { params: { goalId: string } }
) {
    try {
        // 1. Auth & Goal Fetch (Verify Ownership)
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        const userId = new ObjectId(session.user.id);
        let goalObjectId: ObjectId;
        try { goalObjectId = new ObjectId(params.goalId); }
        catch (e) { return NextResponse.json({ message: "Invalid Goal ID format." }, { status: 400 }); }

        const client: MongoClient = await clientPromise;
        const db: Db = client.db();
        const goalsCollection = db.collection<Goal>('goals');
        const goal = await goalsCollection.findOne({ _id: goalObjectId, userId: userId });
        if (!goal) return NextResponse.json({ message: "Goal not found or access denied." }, { status: 404 });

        // 2. Return Existing Suggestions if available
        if (goal.aiSuggestions) {
            console.log(`Returning existing suggestions for goal ${goal._id}`);
            return NextResponse.json({ suggestions: goal.aiSuggestions }, { status: 200 });
        }

        // 3. Generate New Suggestions
        console.log(`Generating new suggestions for goal ${goal._id}`);
        const prompt = `Analyze the following financial goal and provide concise, actionable suggestions (3-5 bullet points using Markdown) on how to achieve it. Focus on savings strategies, potential investment avenues (general types, not specific stocks/funds), and behavioral tips relevant to this goal. Keep suggestions brief.

Goal Title: ${goal.title}
${goal.description ? `Description: ${goal.description}` : ''}
${goal.targetAmount ? `Target Amount: ${formatCurrencyDisplay(goal.targetAmount)}` : ''}
${goal.targetDate ? `Target Date: ${formatDateDisplay(goal.targetDate)}` : ''}
${goal.currentAmount ? `Currently Saved: ${formatCurrencyDisplay(goal.currentAmount)}` : ''}

Suggestions (use Markdown bullet points):
* `;
        const newSuggestions = await getGeminiResponse([], prompt); // Pass empty history

        // 4. Save Suggestions to Database
        const updateResult = await goalsCollection.updateOne(
            { _id: goalObjectId, userId: userId },
            { $set: { aiSuggestions: newSuggestions, updatedAt: new Date() } }
        );
        if (updateResult.modifiedCount === 0) console.warn(`Failed to save generated suggestions for goal ${goal._id}`);

        // 5. Respond with New Suggestions
        return NextResponse.json({ suggestions: newSuggestions }, { status: 200 });

    } catch (error) { /* ... Error Handling ... */ }
}

// --- PUT: Force REGENERATION of suggestions ---
export async function PUT(
    req: NextRequest,
    { params }: { params: { goalId: string } }
) {
     try {
        // 1. Auth & Goal Fetch (Verify Ownership)
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        const userId = new ObjectId(session.user.id);
        let goalObjectId: ObjectId;
        try { goalObjectId = new ObjectId(params.goalId); }
        catch (e) { return NextResponse.json({ message: "Invalid Goal ID format." }, { status: 400 }); }

        const client: MongoClient = await clientPromise;
        const db: Db = client.db();
        const goalsCollection = db.collection<Goal>('goals');
        const goal = await goalsCollection.findOne({ _id: goalObjectId, userId: userId });
        if (!goal) return NextResponse.json({ message: "Goal not found or access denied." }, { status: 404 });

        // 2. *** Construct the SAME detailed prompt as in POST ***
         console.log(`Re-generating suggestions for goal ${goal._id}`);
         const prompt = `
            Analyze the following financial goal and provide concise, actionable suggestions (3-5 bullet points using Markdown) on how to achieve it. Focus on savings strategies, potential investment avenues (general types, not specific stocks/funds), and behavioral tips relevant to this goal. Keep suggestions brief.

            Goal Title: ${goal.title}
            ${goal.description ? `Description: ${goal.description}` : ''}
            ${goal.targetAmount ? `Target Amount: ${formatCurrencyDisplay(goal.targetAmount)}` : ''}
            ${goal.targetDate ? `Target Date: ${formatDateDisplay(goal.targetDate)}` : ''}
            ${goal.currentAmount ? `Currently Saved: ${formatCurrencyDisplay(goal.currentAmount)}` : ''}

            Suggestions (use Markdown bullet points):
            *
        `; // Ensure this prompt construction is identical to the POST handler's

         const newSuggestions = await getGeminiResponse([], prompt); // Call Gemini

        // 3. Save New Suggestions (overwrite existing)
        const updateResult = await goalsCollection.updateOne(
            { _id: goalObjectId, userId: userId },
            { $set: { aiSuggestions: newSuggestions, updatedAt: new Date() } }
        );
         if (updateResult.modifiedCount === 0) console.warn(`Failed to save re-generated suggestions for goal ${goal._id}`);

        // 4. Respond
        return NextResponse.json({ suggestions: newSuggestions }, { status: 200 });

    } catch (error) {
        console.error("Regenerate Goal Suggestion API Error:", error);
        return NextResponse.json({ message: "An error occurred while regenerating suggestions." }, { status: 500 });
    }
}