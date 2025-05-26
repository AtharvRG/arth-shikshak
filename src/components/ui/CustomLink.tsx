// src/components/ui/CustomLink.tsx
"use client";

import React from 'react';
import Link, { LinkProps } from 'next/link'; // Import Next.js Link component and its props type
import { useLoading } from '@/context/LoadingContext'; // Import the custom hook for loading state
import { cn } from '@/lib/utils'; // Import utility for merging class names

// Define sets of hints for different navigation contexts
const HINTS_GENERAL: string[] = [
    "Loading your space...",
    "Fetching financial data...",
    "Crunching the numbers...",
    "Tip: Regularly review your goals.",
    "Optimizing your experience..."
];
const HINTS_TO_CALCULATORS: string[] = [
    "Loading calculators...",
    "Preparing calculation tools...",
    "Simulating financial scenarios...",
    "Get ready to estimate figures...",
];
const HINTS_TO_SNAPSHOT: string[] = [
    "Analyzing your financial snapshot...",
    "Generating charts and insights...",
    "Loading key metrics overview...",
    "Visualizing your financial health...",
];
const HINTS_TO_GOALS: string[] = [
    "Loading your financial goals...",
    "Tracking your progress...",
    "Reviewing target timelines...",
];
const HINTS_TO_PROFILE: string[] = [
    "Loading your profile details...",
    "Fetching your settings...",
    "Preparing editable information...",
];
const HINTS_TO_CHAT_LIST: string[] = [
    "Loading chat conversations...",
    "Accessing your message history...",
    "Getting ready to chat...",
];
// Add more hint sets as needed for other destinations

// Define the props for the CustomLink component, extending Next.js LinkProps
interface CustomLinkProps extends LinkProps {
  children: React.ReactNode; // Must have children to render inside the link
  className?: string; // Optional className for styling the link
  loadingType?: 'fullPage' | 'popup'; // Specify loader type, defaults to 'fullPage'
  loadingHints?: string[]; // Allow passing specific hints overriding defaults
}

// The CustomLink component
export default function CustomLink({
  children,
  href, // The destination URL
  loadingType = 'fullPage', // Default loading type is full screen
  loadingHints, // Optional specific hints override
  onClick, // Allow passing an original onClick handler
  className, // Pass className to the underlying Link
  ...props // Pass any other standard Link props (like 'target', 'rel', etc.)
}: CustomLinkProps) {
  // Get the startLoading function from the loading context
  const { startLoading } = useLoading();

  // Handle the click event on the link
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Determine which set of hints to use based on destination or props
    let hintsToUse: string[];
    if (loadingHints) {
        hintsToUse = loadingHints; // Prioritize specifically passed hints
    } else if (href === '/calculators') {
        hintsToUse = HINTS_TO_CALCULATORS;
    } else if (href === '/snapshot') {
        hintsToUse = HINTS_TO_SNAPSHOT;
    } else if (href === '/goals') {
        hintsToUse = HINTS_TO_GOALS;
    } else if (href === '/profile') {
        hintsToUse = HINTS_TO_PROFILE;
    } else if (href === '/chat') {
        hintsToUse = HINTS_TO_CHAT_LIST;
    // IMPORTANT: Do not trigger 'popup' here by default. Popup is only for dashboard input submission.
    } else {
        hintsToUse = HINTS_GENERAL; // Default hints for other links
    }

    // Call the startLoading function from the context with the determined type and hints
    startLoading(loadingType, hintsToUse);

    // If an original onClick handler was passed, call it too
    if (onClick) {
      onClick(e);
    }

    // Allow the default Next.js Link navigation to proceed
  };

  // Render the Next.js Link component, passing the handleClick and other props
  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}