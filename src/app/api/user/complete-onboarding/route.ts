// src/app/api/user/complete-onboarding/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"; // Use next-auth/next for App Router
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Import your authOptions
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { User as CustomUserType } from '@/models/User'; // Your User interface

// Define the expected shape of the request body (matches OnboardingData in context)
interface OnboardingRequestBody {
  name: string;
  dob: string; // YYYY-MM-DD string
  occupation: string;
  annualSalary: number | string;
  foodExpense: number | string;
  transportExpense: number | string;
  utilitiesExpense: number | string;
  customExpenses: { id: string; category?: string; amount: number | string }[];
  debts: { id: string; type?: string; amount: number | string; emi?: number | string }[];
  investments: { id: string; type?: string; amount: number | string }[];
}

// Helper function to safely parse numbers
const safeParseFloat = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

export async function POST(req: NextRequest) {
  try {
    // 1. Get Authenticated User Session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const userId = session.user.email as string;

    // 2. Parse Request Body
    const body = await req.json() as OnboardingRequestBody;

    // 3. Basic Validation (Add more specific validation as needed)
    if (!body.name || !body.dob || body.annualSalary === '') {
      return NextResponse.json({ message: "Missing required basic information (Name, DOB, Salary)." }, { status: 400 });
    }

    // 4. Data Transformation & Cleaning
    const dobDate = new Date(body.dob); // Convert DOB string to Date object
    if (isNaN(dobDate.getTime())) {
        return NextResponse.json({ message: "Invalid Date of Birth format." }, { status: 400 });
    }

    const salary = safeParseFloat(body.annualSalary);
    if (salary === null || salary < 0) {
        return NextResponse.json({ message: "Invalid Annual Salary." }, { status: 400 });
    }

    // Clean expense/debt/investment numbers
    const cleanExpense = (amount: number | string) => safeParseFloat(amount) ?? 0; // Default to 0 if invalid
    const cleanDebt = (item: any) => {
        const emiValue = safeParseFloat(item.emi);
        return {
            type: item.type || 'Unknown', // Provide default type if empty
            amount: cleanExpense(item.amount),
            emi: emiValue === null ? undefined : emiValue, // EMI should be undefined if null
        };
    };
     const cleanInvestment = (item: any) => ({
        _id: new ObjectId(),
        type: item.type || 'Unknown',
        amount: cleanExpense(item.amount),
    });

    const updateData: Partial<CustomUserType> = {
        name: body.name.trim(),
        dob: dobDate,
        occupation: body.occupation?.trim() || null,
        annualSalary: salary,
        expenses: [ // Combine fixed and custom expenses
            { _id: new ObjectId(), category: 'Food', amount: cleanExpense(body.foodExpense) },
            { _id: new ObjectId(), category: 'Transport', amount: cleanExpense(body.transportExpense) },
            { _id: new ObjectId(), category: 'Utilities', amount: cleanExpense(body.utilitiesExpense) },
            ...body.customExpenses
                .filter(exp => exp.category?.trim() && exp.amount !== '') // Filter out incomplete custom entries
                .map(exp => ({ _id: new ObjectId(), category: exp.category!.trim(), amount: cleanExpense(exp.amount) }))
        ].filter(exp => exp.amount > 0), // Only save expenses with amount > 0
        debts: body.debts
            .filter(d => d.type?.trim() && d.amount !== '')
            .map(d => ({ ...cleanDebt(d), _id: new ObjectId() }))
            .filter(d => d.amount > 0),
        investments: body.investments
            .filter(inv => inv.type?.trim() && inv.amount !== '')
            .map(cleanInvestment)
            .filter(inv => inv.amount > 0),
        onboardingComplete: true, // Mark onboarding as complete
        updatedAt: new Date(),
    };

    // Remove empty arrays if desired (optional)
    if (updateData.expenses?.length === 0) delete updateData.expenses;
    if (updateData.debts?.length === 0) delete updateData.debts;
    if (updateData.investments?.length === 0) delete updateData.investments;


    // 5. Update Database
    const client: MongoClient = await clientPromise;
    const db: Db = client.db();
    const usersCollection = db.collection<CustomUserType>('users');

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) }, // Filter by user's ObjectId
      { $set: updateData }         // Set the new/updated fields
    );

    // 6. Check Result & Respond
    if (result.modifiedCount === 0 && result.matchedCount === 0) {
         // This case means the user ID from the session didn't match any user in the DB
         console.error(`Onboarding Error: User not found with ID: ${userId}`);
         return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
     if (result.modifiedCount === 0 && result.matchedCount === 1) {
         // User found, but nothing was changed (maybe they submitted the same data twice?)
         // Still consider it a success as their onboarding is likely complete.
         console.log(`Onboarding data for user ${userId} already up-to-date or no changes made.`);
         // You could technically return a different status like 204 No Content, but 200 is fine.
    }

    console.log(`Onboarding completed successfully for user: ${userId}`);
    return NextResponse.json({ message: "Onboarding completed successfully." }, { status: 200 });

  } catch (error) {
    console.error("Complete Onboarding Error:", error);
    return NextResponse.json(
      { message: "An error occurred while saving onboarding data." },
      { status: 500 }
    );
  }
}