// src/components/ui/background-beams.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden z-0",
        className
      )}
      // Optional: Add a very faint base color here if needed for contrast
      style={{ backgroundColor: 'rgba(20, 20, 30, 0.1)' }}
    >
      <div className="absolute inset-0 h-full w-full">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
           >
          <defs>
            <pattern
              id="beams-pattern-v3" // New unique ID
              width={40} // Slightly larger pattern size
              height={40}
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)" // Add rotation for diagonal lines
            >
              <path d="M0 0 H40 M0 0 V40" // Simple grid lines
                    strokeWidth={1} // INCREASED stroke width
                    // INCREASED opacity and slightly brighter base color
                    stroke="rgba(180, 180, 180, 0.35)" // <--- ADJUST OPACITY/COLOR HERE
                    fill="none" />
            </pattern>

            <radialGradient id="beams-mask-gradient-v2" cx="50%" cy="50%" r="50%">
               {/* Ensure mask fades out correctly */}
               <stop offset="10%" stopColor="white" stopOpacity={1} />
               <stop offset="80%" stopColor="white" stopOpacity={0} />{/* Adjust fade range */}
             </radialGradient>

             <mask id="beams-mask-v3">
               <rect width="100%" height="100%" fill="url(#beams-mask-gradient-v2)" />
             </mask>
          </defs>

          {/* Apply pattern and mask */}
          <rect
              width="100%"
              height="100%"
              fill="url(#beams-pattern-v3)"
              mask="url(#beams-mask-v3)"
              />
        </svg>
      </div>
    </div>
  );
};