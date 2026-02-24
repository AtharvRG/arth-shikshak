// src/components/layout/loaders/PopupLoader.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Boxes } from '@/components/ui/background-boxes'; // Aceternity background
import CssLoader from '@/components/ui/css-loader'; // Your custom loader
import CyclingHints from './CyclingHints'; // The hints component
import { cn } from '@/lib/utils';

interface PopupLoaderProps {
    hints: string[];
}

export default function PopupLoader({ hints }: PopupLoaderProps) {
    return (
        // Use motion.div for entry/exit animation of the whole popup
        <motion.div
            key="popup-loader-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            // Styling for the popup container
            className={cn(
                "fixed inset-0 z-[100] flex items-center justify-center", // Position fixed, centered
                "bg-black/50 backdrop-blur-sm" // Semi-transparent backdrop with blur
            )}
        >
            {/* Inner card for the loader content */}
            <div className={cn(
                "relative w-full max-w-xs sm:max-w-sm h-auto min-h-[200px]", // Sizing
                "bg-neutral-900/90 rounded-xl shadow-2xl", // Dark background, rounded, shadow
                "border border-neutral-700/50", // Subtle border
                "overflow-hidden", // Clip the Boxes background
                "flex flex-col items-center justify-center p-6 space-y-4" // Internal layout
                )}
             >
                {/* Background Boxes (scaled down) */}
                 <div className="absolute inset-0 opacity-30 scale-[1.8] pointer-events-none"> {/* Scale and reduce opacity */}
                    <Boxes />
                 </div>

                 {/* Loader Animation (Relative to place above boxes) */}
                 <div className="relative z-10">
                    <CssLoader />
                 </div>

                 {/* Cycling Hints (Relative to place above boxes) */}
                 <div className="relative z-10 w-full">
                    <CyclingHints hints={hints} />
                 </div>
             </div>
        </motion.div>
    );
}