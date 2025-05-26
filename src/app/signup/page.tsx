// src/app/signup/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { motion } from "framer-motion";
import { FiUserPlus } from "react-icons/fi";
import CustomLink from "@/components/ui/CustomLink"; // Import CustomLink

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Signup submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // 1. Register user via API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { throw new Error(data.message || `HTTP error! status: ${res.status}`); }

      // 2. Sign user in after successful registration
      console.log('Registration successful, attempting sign in...');
      const signInResult = await signIn('credentials', {
        redirect: false, // Handle redirect manually
        email: email,
        password: password,
      });
      setIsLoading(false); // Stop loading indicator after both steps

      if (signInResult?.error) {
        setError(`Account created, but auto sign-in failed: ${signInResult.error}. Please log in.`);
        router.push('/login'); // Redirect to login on sign-in failure
      } else if (signInResult?.ok) {
        console.log('Sign up & Sign in successful, redirecting to onboarding...');
        // Redirect to onboarding after successful sign up and sign in
        // Let NavigationEvents handle loading state for this redirect
        router.push('/onboarding/step1');
        router.refresh();
      } else {
         setError("Account created, but failed to sign in. Please log in.");
         router.push('/login');
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Signup Error Catch:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred.");
    }
  };

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="relative flex flex-col gap-4 items-center justify-center px-4 z-10"
      >
         <div className="w-full max-w-md p-8 space-y-6 bg-black/70 backdrop-blur-md rounded-lg shadow-2xl border border-neutral-800">
           <div className="text-center">
             <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
             <p className="text-neutral-400">Start your journey with Arth Shikshak.</p>
           </div>
           {error && (
             <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-md text-sm text-center">
               {error}
             </div>
           )}
           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
             </div>
             <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="Create a strong password" required className="mt-1" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
             </div>
             <MovingBorderButton type="submit" borderRadius="1.75rem" containerClassName="w-full h-12"
                className={`bg-blue-600 border-slate-800 text-white text-base font-semibold flex items-center justify-center gap-2 transition-colors duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                disabled={isLoading} >
                {isLoading ? 'Creating Account...' : ( <> <span>Sign Up</span> <FiUserPlus className="w-5 h-5" /> </> )}
             </MovingBorderButton>
           </form>
            <p className="text-center text-sm text-neutral-400">
                 Already have an account?{" "}
                 {/* Use CustomLink for Log In link */}
                 <CustomLink href="/login" loadingType="fullPage" className="font-medium text-blue-500 hover:underline">
                   Log In
                 </CustomLink>
            </p>
         </div>
      </motion.div>
    </AuroraBackground>
  );
}