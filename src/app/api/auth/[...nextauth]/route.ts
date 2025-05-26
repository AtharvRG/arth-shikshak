// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import { MongoClient, Db } from 'mongodb';
import bcrypt from 'bcrypt';
import { User as CustomUserType } from '@/models/User';

interface ExtendedUser extends CustomUserType {
  id: string;
  onboardingComplete?: boolean;
}

export const authOptions: NextAuthOptions = {
  // Keep adapter for potential future OAuth use and profile data sync
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: new URL(process.env.MONGODB_URI!).pathname.substring(1)
  }),

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req): Promise<ExtendedUser | null> {
        // ... (authorize function remains the same) ...
        if (!credentials?.email || !credentials?.password) { throw new Error('Missing email or password'); }
        const client: MongoClient = await clientPromise;
        const db: Db = client.db();
        const user = await db.collection<CustomUserType>('users').findOne({ email: credentials.email });
        if (!user) { console.log("No user found"); return null; }
        if (!user.password) { console.log("User found but no password"); return null; }
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) { console.log("Invalid password"); return null; }
        console.log("Credentials valid for user:", user.email);
        return {
            _id: user._id,
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            onboardingComplete: user.onboardingComplete,
            dob: user.dob,
            occupation: user.occupation,
            annualSalary: user.annualSalary,
        };
      }
    })
  ],

  // *** CHANGE SESSION STRATEGY TO JWT ***
  session: {
    strategy: 'jwt', // <--- Use JWT strategy with CredentialsProvider
    // maxAge and updateAge are relevant for JWT expiry, adjust if needed
    maxAge: 30 * 24 * 60 * 60, // 30 days JWT validity
    // updateAge is not used for JWT strategy
  },

  // Callbacks need adjustment for JWT strategy
  callbacks: {
     // JWT callback runs first, encodes user info into the token
     async jwt({ token, user, account, profile, isNewUser }) {
        // On successful sign in (initial JWT creation)
        if (user) {
            token.id = user.id; // Add user ID to the token
            // Add other user properties needed client-side to the token
            // Type assertion needed as 'user' from authorize might have more fields
            token.onboardingComplete = (user as ExtendedUser).onboardingComplete;
            // Add other fields like name, email if not default in token
            // token.email = user.email;
            // token.name = user.name;
        }
        return token; // The token is then used by the session callback
     },

    // Session callback reads data from the JWT token to build the session object
    async session({ session, token, user }) {
        // 'user' parameter might be from adapter, 'token' has JWT data
        if (token && session.user) {
           session.user.id = token.id as string; // Add ID from token to session
           // Add other properties from token to session user object
           (session.user as ExtendedUser).onboardingComplete = token.onboardingComplete as boolean;
           // session.user.name = token.name as string; // If added to JWT
           // session.user.email = token.email as string; // If added to JWT
        }
        return session; // Session object used by useSession() hook
    },
  },

  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };