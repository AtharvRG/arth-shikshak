// src/components/ui/card-spotlight.tsx
"use client";

// Ensure correct framer-motion import
import { useMotionValue, motion, useMotionTemplate } from "framer-motion";
import React, { MouseEvent as ReactMouseEvent, useState } from "react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect"; // Import canvas effect
import { cn } from "@/lib/utils";

// Using the exact CardSpotlight component code provided by the user
export const CardSpotlight = ({
  children,
  radius = 350,
  color = "#262626", // Default color from the provided code
  className,
  ...props
}: {
  radius?: number;
  color?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: ReactMouseEvent<HTMLDivElement>) {
    if (!currentTarget) return;
    let { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const [isHovering, setIsHovering] = useState(false);
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);
  return (
    <div
      className={cn(
        // Base styles from the provided code
        "group/spotlight p-10 rounded-md relative border border-neutral-800 bg-black dark:border-neutral-800 overflow-hidden", // Added overflow-hidden
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Spotlight effect layer using background color and mask */}
      <motion.div
        className="pointer-events-none absolute z-0 -inset-px rounded-md opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
        style={{
          // The original code uses backgroundColor and maskImage for spotlight
          backgroundColor: color,
          maskImage: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              white,
              transparent 80%
            )
          `,
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              white,
              transparent 80%
            )
          `,
        }}
      >
        {/* Conditionally render CanvasRevealEffect INSIDE the spotlight div */}
        {isHovering && (
          <CanvasRevealEffect
            animationSpeed={5} // Speed from original code
            containerClassName="bg-transparent absolute inset-0 pointer-events-none" // Ensure transparent bg
            colors={[ // Colors from original code
              [59, 130, 246], // blue
              [139, 92, 246], // purple
            ]}
            dotSize={3} // Dot size from original code
            // showGradient={true} // Optionally add back the gradient overlay if desired
          />
        )}
      </motion.div>
      {/* Render children on top */}
      <div className="relative z-20">{children}</div>
    </div>
  );
};