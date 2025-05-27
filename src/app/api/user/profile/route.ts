// src/app/api/user/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { User as CustomUserType } from '@/models/User'; // Your User interface
import { safeParseFloat } from '@/lib/utils'; // Import the helper

// Define the expected shape of the update request body
interface UpdateProfileRequestBody {
  name?: string;
  dob?: string; // YYYY-MM-DD string
  occupation?: string;
  annualSalary?: number | string;
  foodExpense?: number | string;
  transportExpense?: number | string;
  utilitiesExpense?: number | string;
  customExpenses?: { id?: string; category?: string; amount: number | string }[];
  debts?: { id?: string; type?: string; amount: number | string; emi?: number | string }[];
  investments?: { id?: string; type?: string; amount: number | string }[];
}


// PUT handler for updating user profile
export async function PUT(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const userId = new ObjectId((session.user as any).id);

    // 2. Parse Request Body
    const body = await req.json() as UpdateProfileRequestBody;

    // 3. Data Validation & Transformation
    const updateData: Partial<CustomUserType> = {}; // Build object with only fields to update

    // Update simple fields, allowing clearing with empty string/null
    if (body.name !== undefined) updateData.name = body.name.trim() || null;
    if (body.occupation !== undefined) updateData.occupation = body.occupation.trim() || null;

    // Update DOB, validate date format
    if (body.dob) {
        const dobDate = new Date(body.dob);
        // Ensure it's a valid date and not in the future (basic check)
        if (!isNaN(dobDate.getTime()) && dobDate <= new Date()) {
            updateData.dob = dobDate;
        } else {
             console.warn(`Invalid DOB received for user ${userId}: ${body.dob}`);
             // Optionally return 400 Bad Request if needed
             // return NextResponse.json({ message: "Invalid Date of Birth provided." }, { status: 400 });
        }
    } else if (body.dob !== undefined) { // Handle clearing DOB
        updateData.dob = null;
    }

    // Update Annual Salary, validate number
    if (body.annualSalary !== undefined) {
        const salary = safeParseFloat(body.annualSalary);
        if (salary !== null && salary >= 0) {
             updateData.annualSalary = salary;
        } else if (body.annualSalary === '' || body.annualSalary === null) { // Allow clearing
             updateData.annualSalary = null;
        } else {
             console.warn(`Invalid Annual Salary received for user ${userId}: ${body.annualSalary}`);
             // Optionally return 400 Bad Request
             // return NextResponse.json({ message: "Invalid Annual Salary provided." }, { status: 400 });
        }
    }

    // --- Process Expenses ---
    // Check if any expense field was included in the request before updating the whole array
    const shouldUpdateExpenses = body.foodExpense !== undefined || body.transportExpense !== undefined || body.utilitiesExpense !== undefined || body.customExpenses !== undefined;
    if (shouldUpdateExpenses) {
        const expensesToSave = [];
        // Add fixed expenses if present in body
        if (body.foodExpense !== undefined) expensesToSave.push({ category: 'Food', amount: safeParseFloat(body.foodExpense) ?? 0 });
        if (body.transportExpense !== undefined) expensesToSave.push({ category: 'Transport', amount: safeParseFloat(body.transportExpense) ?? 0 });
        if (body.utilitiesExpense !== undefined) expensesToSave.push({ category: 'Utilities', amount: safeParseFloat(body.utilitiesExpense) ?? 0 });
        // Add custom expenses if present in body
        if (body.customExpenses) {
            body.customExpenses.forEach(exp => {
                const category = exp.category?.trim();
                const amount = safeParseFloat(exp.amount);
                if (category && amount !== null && amount >= 0) { // Ensure valid category and amount
                    expensesToSave.push({ category: category, amount: amount });
                }
            });
        }
        // Update the expenses field only with valid, non-zero entries
        updateData.expenses = expensesToSave.filter(exp => exp.amount > 0);
    }


    // --- Process Debts ---
    if (body.debts !== undefined) {
        updateData.debts = body.debts
            .filter(d => d.type?.trim() && d.amount !== '' && safeParseFloat(d.amount) !== null && safeParseFloat(d.amount)! >= 0) // Ensure type and valid amount
            .map(d => {
                const parsedEmi = safeParseFloat(d.emi);
                return {
                    type: d.type!.trim(),
                    amount: safeParseFloat(d.amount)!, // We know it's valid from filter
                    // *** FIX: Convert null EMI to undefined to match type ***
                    emi: (parsedEmi !== null && parsedEmi >= 0) ? parsedEmi : undefined
                };
            })
            .filter(d => d.amount > 0); // Only save debts with a positive amount
    }

    // --- Process Investments ---
    if (body.investments !== undefined) {
        updateData.investments = body.investments
            .filter(inv => inv.type?.trim() && inv.amount !== '' && safeParseFloat(inv.amount) !== null && safeParseFloat(inv.amount)! >= 0)
            .map(inv => ({
                type: inv.type!.trim(),
                amount: safeParseFloat(inv.amount)!
            }))
            .filter(inv => inv.amount > 0);
    }


    // Prevent accidental overwrite of critical fields
    delete (updateData as any)._id;
    delete (updateData as any).email;
    delete (updateData as any).emailVerified;
    delete (updateData as any).password;
    delete updateData.onboardingComplete; // Ensure onboarding status isn't changed here
    delete (updateData as any).createdAt; // Don't change creation date


    // 4. Update Database only if there's something to update
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: "No valid fields provided for update." }, { status: 400 });
    }
    // Add updatedAt timestamp
    updateData.updatedAt = new Date();


    const client: MongoClient = await clientPromise;
    const db: Db = client.db();
    const usersCollection = db.collection<CustomUserType>('users');

    // Perform the update operation
    const result = await usersCollection.updateOne(
      { _id: userId },
      { $set: updateData }
    );

    // 5. Check Result & Respond
    if (result.matchedCount === 0) {
         return NextResponse.json({ message: "User profile not found." }, { status: 404 });
    }
    if (result.modifiedCount === 0) {
        console.log(`Profile data for user ${userId} was submitted but resulted in no changes.`);
        // Consider this success, as the desired state is achieved
        return NextResponse.json({ message: "Profile data unchanged." }, { status: 200 });
    }

    console.log(`Profile updated successfully for user: ${userId}`);
    return NextResponse.json({ message: "Profile updated successfully." }, { status: 200 });

  } catch (error) {
    console.error("Update Profile API Error:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the profile." },
      { status: 500 }
    );
  }
}