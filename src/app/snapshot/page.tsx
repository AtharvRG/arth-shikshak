// src/app/snapshot/page.tsx
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { User as CustomUserType } from '@/models/User';
import { ObjectId, Db, MongoClient } from 'mongodb';
import Navbar from '@/components/layout/Navbar';
import SnapshotClientContent from '@/components/snapshot/SnapshotClientContent'; // Import Client Component
import { FiAlertCircle } from 'react-icons/fi';
import { redirect } from 'next/navigation';

// --- Server-Side Data Fetching Function ---
async function getUserFinancialData(userId: string): Promise<Partial<CustomUserType> | null> {
    try {
        const userObjectId = new ObjectId(userId);
        const client: MongoClient = await clientPromise;
        const db: Db = client.db();
        const usersCollection = db.collection<CustomUserType>('users');
        // Fetch necessary fields for the snapshot
        const user = await usersCollection.findOne(
            { _id: userObjectId },
            {
                projection: { // Specify only the fields needed by the client component
                    _id: 0, name: 1, annualSalary: 1, expenses: 1,
                    debts: 1, investments: 1, onboardingComplete: 1
                }
            }
        );
        // Use JSON stringify/parse for deep cloning and ensuring data is serializable
        // This prevents issues passing complex types like ObjectId or Date to Client Components
        return user ? JSON.parse(JSON.stringify(user)) : null;
    } catch (error) {
        console.error("Error fetching user data for snapshot:", error);
        return null; // Return null on error
    }
}
// --- End Data Fetching ---

// --- Main Snapshot Page Component (Server Component) ---
export default async function SnapshotPage() {
    // 1. Get User Session Server-Side
    const session = await getServerSession(authOptions);

    // 2. Authentication Check: Redirect if not logged in
    if (!session?.user?.id) {
        const callbackUrl = encodeURIComponent('/snapshot');
        redirect(`/login?callbackUrl=${callbackUrl}`);
    }

    // 3. Fetch User Financial Data
    const userData = await getUserFinancialData(session.user.id);

    // 4. Handle Data Fetching Error: Render error message within layout
    if (!userData) {
         return (
             <div className="flex flex-col h-screen bg-black">
                 <Navbar />
                 <main className="flex-1 p-4 md:p-6 lg:p-10">
                    <div className="flex items-center justify-center h-full text-center text-red-400 p-4">
                        <FiAlertCircle className="w-8 h-8 mr-2 shrink-0"/> Error loading your financial data. Please refresh or try again later.
                    </div>
                 </main>
             </div>
         );
    }

    // 5. Onboarding Check: Redirect if incomplete
    if (!userData.onboardingComplete) {
        console.log("User onboarding incomplete on snapshot page, redirecting.");
        redirect('/onboarding/step1');
    }

    // 6. Render the Client Component, passing the fetched/serialized data
    return (
        <div className="flex flex-col min-h-screen bg-black">
            <Navbar />
            {/* The SnapshotClientContent handles the actual UI rendering and interactivity */}
            <SnapshotClientContent userData={userData} />
        </div>
    );
}