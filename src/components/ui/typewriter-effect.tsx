// src/components/ui/typewriter-effect.tsx
"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion"; // Correct import
import React, { useEffect } from 'react';
import { cn } from "@/lib/utils";

interface TypewriterEffectProps {
  text: string;
  duration?: number; // Total duration for the whole text
  className?: string;
  delay?: number; // Delay before starting
  onComplete?: () => void; // Optional callback
}

export function TypewriterEffect({
    text,
    duration = 2, // Default duration is 2 seconds
    className,
    delay = 0,
    onComplete
}: TypewriterEffectProps) {
  const count = useMotionValue(0); // Motion value from 0 to text.length
  // Transform count to the rounded integer value
  const rounded = useTransform(count, (latest) => Math.round(latest));
  // Transform the rounded count to a slice of the text
  const displayText = useTransform(rounded, (latest) => text.slice(0, latest));

  useEffect(() => {
    // Animate the 'count' value from 0 to text.length over the specified 'duration'
    const controls = animate(count, text.length, {
      type: "tween", // Use tween for linear progression
      duration: duration,
      ease: "linear", // Constant speed
      delay: delay,
      onComplete: onComplete // Trigger callback when done
    });
    // Return the stop function for cleanup
    return controls.stop;
  // Add onComplete to dependency array if it's expected to change and affect the animation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, duration, text.length, delay]); // Rerun if text length or duration changes

  // Render the animated text slice within a motion span
  return (
    <motion.span className={cn(className)}>
      {displayText}
    </motion.span>
  );
}