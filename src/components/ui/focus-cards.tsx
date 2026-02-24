// src/components/ui/focus-cards.tsx
"use client";

import React, { useState, memo } from "react";
import { cn } from "@/lib/utils"; // Utility for merging class names
import Image from 'next/image'; // Use Next.js Image for optimization
import { useFocusEffect } from "@/context/FocusEffectContext"; // Import context hook for blur state

// Type definition for the data structure of each card
export type CardData = {
  title: string; // Used for keys and fallback alt text
  src: string; // Fallback image source (often overridden by content)
  content?: React.ReactNode; // Custom React Node content to render inside the card
  className?: string; // Optional classes for the outer card container div
};

// Memoized Card Component: Renders a single card within the grid
export const Card = memo(
  ({
    card,
    index,
    hovered, // Index of the currently hovered card (or null)
    setHovered, // Function to update the hovered index state
  }: {
    card: CardData;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => {
    // Consume the focus effect context to check if blur should be applied
    const { isBlurEnabled } = useFocusEffect();

    return (
      <div
        onMouseEnter={() => setHovered(index)} // Set this card as hovered on mouse enter
        onMouseLeave={() => setHovered(null)} // Clear hover state on mouse leave
        className={cn(
          // Base styling for the card container
          "rounded-xl relative overflow-hidden", // Rounded corners, relative positioning, hidden overflow
          "border border-neutral-800/80", // Subtle border for definition
          "bg-neutral-900/50 backdrop-blur-lg", // Glassmorphism effect: semi-transparent background + blur
          "h-auto min-h-[180px] md:min-h-[200px]", // Default minimum heights, allowing content to expand
          "transition-all duration-300 ease-out", // Smooth transitions for effects
          // Conditional styling: Apply blur/scale/opacity ONLY if blur effect is enabled
          // AND if another card (not this one) is currently hovered
          isBlurEnabled && hovered !== null && hovered !== index && "blur-md scale-[0.97] opacity-60",
          card.className // Allow applying custom classes (e.g., grid spans, specific heights)
        )}
      >
        {/* Render custom content if provided, otherwise fallback */}
        {card.content ? (
            // Wrapper ensures content is above potential fallback image/overlay
            <div className="relative z-10 h-full w-full">
               {card.content}
           </div>
        ) : (
           // Fallback rendering (image with title overlay) if no 'content' prop is passed
           <>
               <Image
                  src={card.src || "/noise.webp"} // Use provided src or default noise
                  alt={card.title}
                  fill // Cover the container area
                  className="object-cover absolute inset-0" // Image styling
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive image sizes
               />
               {/* Gradient overlay shown on hover */}
               <div
                 className={cn(
                   "absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end py-6 px-4 transition-opacity duration-300",
                   hovered === index ? "opacity-100" : "opacity-0" // Fade in/out based on hover state
                 )}
               >
                 {/* Title text on overlay */}
                 <div className="text-base md:text-lg lg:text-xl font-semibold text-white drop-shadow-md">
                   {card.title}
                 </div>
               </div>
           </>
        )}
      </div>
    )
  }
);
Card.displayName = "Card"; // Set display name for React DevTools

// Main FocusCards Component: Manages the grid layout and hover state
export function FocusCards({ cards }: { cards: CardData[] }) {
  // State to track the index of the card currently being hovered
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    // Grid container for the cards
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 w-full">
      {/* Map over the provided card data array */}
      {cards.map((card, index) => (
        // Render each card component
        <Card
          key={card.title + '-' + index} // Generate a unique key
          card={card} // Pass the card data
          index={index} // Pass the card's index
          hovered={hovered} // Pass the current hover state
          setHovered={setHovered} // Pass the function to update hover state
        />
      ))}
    </div>
  );
}