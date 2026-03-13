// src/app/chat/page.tsx
"use client"; // Mark as Client Component for motion animations

import React from 'react';
import { FiMessageSquare } from 'react-icons/fi'; // Icon for visual cue
import { motion } from 'framer-motion'; // Import for animations

export default function SelectChatPage() {
  // This component renders within the ChatLayout provided above.
  // The Navbar and Sidebar are already part of the layout.

  return (
    // Use motion.div for entry animation
    <motion.div
        initial={{ opacity: 0, y: 20 }} // Start slightly down and invisible
        animate={{ opacity: 1, y: 0 }} // Animate to full opacity and original position
        transition={{ duration: 0.4, ease: "easeOut" }} // Animation timing
        // Flexbox to center content within the available main area
        className="flex flex-col items-center justify-center h-full text-center bg-neutral-900 p-6 md:p-8"
    >
        {/* Large icon */}
        <FiMessageSquare className="w-14 h-14 md:w-16 md:h-16 text-neutral-600 mb-6" />

        {/* Heading */}
        <h2 className="text-xl md:text-2xl font-semibold text-neutral-200 mb-2">
            Select a Chat or Start a New One
        </h2>

        {/* Guiding text */}
        <p className="text-sm md:text-base text-neutral-500 max-w-sm">
            Choose a previous conversation from the history panel on the left, or click the &quot;New Chat&quot; button to begin planning with Arth Shikshak.
        </p>
    </motion.div>
  );
}