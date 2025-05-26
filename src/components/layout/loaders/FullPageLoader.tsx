// src/components/layout/loaders/FullPageLoader.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Boxes } from '@/components/ui/background-boxes';
import CssLoader from '@/components/ui/css-loader';
import CyclingHints from './CyclingHints';
import { cn } from '@/lib/utils';

interface FullPageLoaderProps {
    hints: string[];
}

export default function FullPageLoader({ hints }: FullPageLoaderProps) {
    return (
        // Use motion.div for fade in/out
        <motion.div
            key="fullpage-loader-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            // Full screen, fixed position, high z-index
            className={cn(
                "fixed inset-0 z-[99] flex flex-col items-center justify-center",
                "bg-neutral-950" // Solid background
            )}
        >
            {/* Background Boxes covering the screen */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
                <Boxes />
            </div>

             {/* Loader Animation (Relative to place above boxes) */}
             <div className="relative z-10 mb-6"> {/* Add margin bottom */}
                <CssLoader />
             </div>

             {/* Cycling Hints (Relative to place above boxes) */}
             <div className="relative z-10 w-full max-w-md"> {/* Limit hint width */}
                <CyclingHints hints={hints} className="text-base" /> {/* Slightly larger text */}
             </div>

        </motion.div>
    );
}