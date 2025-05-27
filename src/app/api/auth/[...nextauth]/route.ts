// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions, User as NextAuthUser, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt'; // Import JWT from next-auth/jwt instead
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import { MongoClient, Db, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { User as CustomUserDbModel } from '@/models/User'; // Your DB User model type

// Define how our user object looks in the NextAuth session and JWT token
// This should include custom fields.
interface SessionUser extends NextAuthUser {
  id: string; // Ensure ID is always string here
  onboardingComplete?: boolean;
  // Add other fields you put in the token/session if needed
  // name?: string | null;
  // email?: string | null;
}

// Define how your user object looks coming from the 'authorize' function
// This is closer to your DB model but with a string 'id' for NextAuth internal use.
interface AuthorizeUser extends Omit<CustomUserDbModel, '_id' | 'password'> {
    id: string; // String version of _id
    // Keep other relevant fields
    onboardingComplete?: boolean;
}


export const authOptions: NextAuthOptions = {
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
      async authorize(credentials, req): Promise<AuthorizeUser | null> { // Return AuthorizeUser type
        if (!credentials?.email || !credentials?.password) { throw new Error('Missing email or password'); }
        const client: MongoClient = await clientPromise;
        const db: Db = client.db();
        // Fetch user based on CustomUserDbModel which includes _id as ObjectId
        const userFromDb = await db.collection<CustomUserDbModel>('users').findOne({ email: credentials.email });

        if (!userFromDb) { console.log("No user found"); return null; }
        if (!userFromDb.password) { console.log("User found but no password set"); return null; }

        const isValidPassword = await bcrypt.compare(credentials.password, userFromDb.password);
        if (!isValidPassword) { console.log("Invalid password"); return null; }

        console.log("Credentials valid for user:", userFromDb.email);
        // Return the AuthorizeUser structure
        return {
            id: userFromDb._id.toString(), // Convert ObjectId to string for NextAuth
            name: userFromDb.name,
            email: userFromDb.email,
            emailVerified: userFromDb.emailVerified,
            image: userFromDb.image,
            onboardingComplete: userFromDb.onboardingComplete,
            // Add other fields present in CustomUserDbModel if they should be in AuthorizeUser
            dob: userFromDb.dob,
            occupation: userFromDb.occupation,
            annualSalary: userFromDb.annualSalary,
            expenses: userFromDb.expenses,
            debts: userFromDb.debts,
            investments: userFromDb.investments,
            createdAt: userFromDb.createdAt,
            updatedAt: userFromDb.updatedAt,
        };
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
     // JWT callback: Runs when a JWT is created (on sign in) or updated
     // The 'user' parameter here is the object returned by the 'authorize' function
     async jwt({ token, user, account, profile, isNewUser }): Promise<JWT> {
        if (user) { // This 'user' is of type AuthorizeUser (or NextAuthUser for OAuth)
            token.id = user.id; // Add string id from authorize user
            // Cast user to AuthorizeUser to access custom properties safely
            const authorizeUser = user as AuthorizeUser;
            token.onboardingComplete = authorizeUser.onboardingComplete;
            token.name = authorizeUser.name; // Ensure name and email are in token
            token.email = authorizeUser.email;
            token.picture = authorizeUser.image; // Use 'picture' for standard JWT image claim
        }
        return token; // Return the modified token
     },

    // Session callback: Runs when a session is checked
    // The 'token' parameter here is the decoded JWT from the 'jwt' callback
    // The 'user' parameter might be from the adapter (if session strategy was 'database'),
    // but for JWT strategy, we primarily rely on the 'token'.
    async session({ session, token, user }): Promise<Session> { // Ensure return type is Session
        if (token && session.user) {
           // Populate session.user with data from the token
           // Cast session.user to SessionUser to assign custom properties
           const sessionUser = session.user as SessionUser;
           sessionUser.id = token.id as string;
           sessionUser.onboardingComplete = token.onboardingComplete as boolean;
           // Standard fields like name, email, image should map from token
           sessionUser.name = token.name;
           sessionUser.email = token.email;
           sessionUser.image = token.picture; // Use 'picture' from token for image
        }
        return session; // Return the session
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