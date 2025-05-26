// src/app/onboarding/layout.tsx
import React from 'react';
import { OnboardingProvider } from '@/context/OnboardingContext'; // Import the provider
import { cn } from '@/lib/utils'; // If needed for styling

// Optional: Add metadata specific to onboarding
// export const metadata = {
//   title: 'Complete Your Profile - Arth Shikshak',
// };

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Wrap the children with the OnboardingProvider
    <OnboardingProvider>
       {/* Add a wrapper div for consistent styling */}
       <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-black to-neutral-900 px-4 py-12">
          {/* Optional: Add a progress bar or header here */}
          {/* <div className="w-full max-w-xl mb-8"> Progress Bar... </div> */}

          {/* Render the current onboarding step page */}
          {children}
       </div>
    </OnboardingProvider>
  );
}