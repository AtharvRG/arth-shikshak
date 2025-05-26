// src/app/profile/page.tsx
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { User as CustomUserType } from '@/models/User';
import { Goal as GoalType } from '@/models/Goal';
import { ObjectId, Db, MongoClient } from 'mongodb';
import Navbar from '@/components/layout/Navbar';
import ProfileClientPageWrapper from '@/components/profile/ProfileClientPage'; // Import the wrapper
import { FiAlertCircle } from 'react-icons/fi';
import { redirect } from 'next/navigation';

// Define the fully populated user data type expected by the client component
type ProfilePageData = Omit<CustomUserType, '_id' | 'password' | 'goals'> & {
    _id: string; // Ensure ID is string after serialization
    goals: (Omit<GoalType, '_id' | 'userId'> & { _id: string; userId: string })[]; // Ensure goal IDs are strings
};


// --- Server-Side Data Fetching Function ---
async function getUserProfileData(userId: string): Promise<ProfilePageData | null> {
    try {
        const userObjectId = new ObjectId(userId);
        const client: MongoClient = await clientPromise;
        const db: Db = client.db();
        const usersCollection = db.collection<CustomUserType>('users');
        const goalsCollection = db.collection<GoalType>('goals');

        const user = await usersCollection.findOne({ _id: userObjectId }, { projection: { password: 0 } });
        if (!user) return null;

        const userGoals = await goalsCollection.find({ userId: userObjectId }).sort({ createdAt: -1 }).toArray();

        const fullUserData = { ...user, goals: userGoals || [], };

        // Serialize ensuring nested ObjectIds/Dates are converted
        return JSON.parse(JSON.stringify(fullUserData));

    } catch (error) {
        console.error("Error fetching user profile data (including goals):", error);
        return null;
    }
}
// --- End Data Fetching Function ---


// --- Main Profile Page Component (Server Component) ---
export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) { redirect(`/login?callbackUrl=/profile`); }

    const userData = await getUserProfileData(session.user.id);

    // 4. Handle Data Fetching Error: Render an error message within the layout
    if (!userData) {
         return (
             <div className="flex flex-col h-screen bg-black">
                 <Navbar />
                 <main className="flex-1 p-4 md:p-6 lg:p-10">
                    <div className="flex items-center justify-center h-full text-center text-red-400 p-4 bg-neutral-900/50 border border-red-800 rounded-lg">
                        <FiAlertCircle className="w-8 h-8 mr-2 shrink-0"/> Error loading your profile data. Please refresh or try again later.
                    </div>
                 </main>
             </div>
         );
    }

    // 5. Onboarding Check: Redirect if incomplete
    if (!userData.onboardingComplete) { redirect('/onboarding/step1'); }

    return (
        <div className="flex flex-col min-h-screen bg-black">
            <Navbar />
            <main className="flex-1 p-4 md:p-6 lg:p-10">
                {/* Pass the correctly typed and serialized data */}
                <ProfileClientPageWrapper initialData={userData as ProfilePageData} />
            </main>
        </div>
    );
}