// src/components/layout/loaders/CyclingHints.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CyclingHintsProps {
    hints: string[];
    interval?: number; // Interval in milliseconds
    className?: string;
}

export default function CyclingHints({ hints, interval = 4000, className }: CyclingHintsProps) {
    const [currentHintIndex, setCurrentHintIndex] = useState(0);

    useEffect(() => {
        if (!hints || hints.length === 0) return;

        const timer = setInterval(() => {
            setCurrentHintIndex((prevIndex) => (prevIndex + 1) % hints.length);
        }, interval);

        // Clear interval on component unmount
        return () => clearInterval(timer);
    }, [hints, interval]); // Rerun if hints array or interval changes

    if (!hints || hints.length === 0) {
        return null; // Don't render if no hints
    }

    return (
        <div className={cn("text-center", className)}>
            <AnimatePresence mode="wait">
                <motion.p
                    key={currentHintIndex} // Key change triggers animation
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="text-sm text-neutral-300 px-4"
                >
                    {hints[currentHintIndex]}
                </motion.p>
            </AnimatePresence>
        </div>
    );
}