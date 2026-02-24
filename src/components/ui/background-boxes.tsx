// src/components/ui/background-boxes.tsx
"use client";
import React from "react";
import { motion } from "framer-motion"; // Corrected import path
import { cn } from "@/lib/utils";

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const rows = new Array(150).fill(1);
  const cols = new Array(100).fill(1);
  let colors = [ // Keep your preferred colors
    "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b",
    "#ef4444", "#d8b4fe", "#60a5fa", "#a5b4fc", "#c4b5fd",
  ];
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div
      style={{
        // Adjust transform for better full-screen coverage potentially
        // May need tweaking based on visual result
        transform: `translate(-50%,-50%) skewX(-48deg) skewY(14deg) scale(1) rotate(0deg) translateZ(0)`,
      }}
      // Ensure it covers the parent absolutely, adjust positioning
      className={cn(
        "absolute left-1/2 top-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2",
        // Ensure it can expand - adjust width/height or use inset-0 on parent
        "h-[150vh] w-[150vw]", // Make it larger than viewport to ensure coverage when skewed/rotated
        className
      )}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div
          key={`row` + i}
          className="relative h-8 w-16 border-l border-neutral-800/50"        >
          {cols.map((_, j) => (
            <motion.div
              whileHover={{
                backgroundColor: `${getRandomColor()}`,
                transition: { duration: 0 },
              }}
              animate={{
                transition: { duration: 2 },
              }}
              key={`col` + j}
              className="relative h-8 w-16 border-t border-r border-neutral-800/50 bg-transparent hover:shadow-xl"             >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="pointer-events-none absolute -top-[14px] -left-[22px] h-6 w-10 stroke-[1px] text-neutral-800" // Darker stroke
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);