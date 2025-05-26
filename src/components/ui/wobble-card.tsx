// src/components/ui/wobble-card.tsx
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion"; // Correct import path
import { cn } from "@/lib/utils";

// Noise component for the background texture
const Noise = () => {
  return (
    <div
      className="absolute inset-0 w-full h-full scale-[1.2] transform opacity-10 [mask-image:radial-gradient(#fff,transparent,75%)]"
      style={{
        // Ensure the path is correct relative to the 'public' folder
        backgroundImage: "url(/noise.webp)",
        backgroundSize: "30%",
      }}
    ></div>
  );
};

// Main WobbleCard component
export const WobbleCard = ({
  children,
  containerClassName,
  className,
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Update mouse position relative to the card center
  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    // Divide by a factor (e.g., 20) to reduce sensitivity/movement range
    const x = (clientX - (rect.left + rect.width / 2)) / 20;
    const y = (clientY - (rect.top + rect.height / 2)) / 20;
    setMousePosition({ x, y });
  };

  // Reset position on mouse leave
  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    // Outer container with motion for card translation
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        // Apply transform based on hover state and mouse position
        transform: isHovering
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
          : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
        transition: "transform 0.1s ease-out", // Smooth transition for transform
      }}
      // Base styles for the container, passed styles override/extend
      className={cn(
        // Use a default dark background, allow override via containerClassName
        "relative rounded-2xl overflow-hidden bg-neutral-800", // Adjusted default background
        containerClassName // Apply container specific styles (like grid spans, bg colors)
      )}
    >
      {/* Inner container applying the background gradient overlay and shadow */}
      <div
        className="relative h-full [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.07),rgba(255,255,255,0))] sm:rounded-2xl overflow-hidden" // Adjusted gradient opacity for dark theme
        style={{
          // Using Tailwind shadows instead of direct box-shadow string for consistency
          // Apply shadow classes to the outer motion.section if preferred
        }}
      >
        {/* Innermost div that inversely transforms content */}
        <motion.div
          style={{
            // Apply inverse transform to content for the wobble effect
            transform: isHovering
              ? `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0) scale3d(1.03, 1.03, 1)` // Scale content slightly up
              : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)", // Default state
            transition: "transform 0.1s ease-out", // Smooth transition
          }}
          // Apply base padding and passed className for content styling
          className={cn("h-full px-6 py-8 sm:px-10", className)} // Adjusted base padding
        >
          {/* Noise texture overlay */}
          <Noise />
          {/* Render the actual children passed to the card */}
          {children}
        </motion.div>
      </div>
    </motion.section>
  );
};