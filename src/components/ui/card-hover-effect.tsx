// src/components/ui/card-hover-effect.tsx
"use client"; // This component uses state and event handlers

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion"; // Use framer-motion directly
import React, { useState } from "react"; // Import React
import Link from 'next/link'; // Import Next.js Link

// Type definition for the items passed to HoverEffect
export type HoverCardItem = {
  title: string;
  description: string;
  link?: string; // Optional link for the card
  content?: React.ReactNode; // Optional: Render custom content instead of title/desc
  id?: string; // Optional: ID for targeting specific cards if needed
};

// Card Component: Defines the appearance of each card
export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        // Base styling for the card container
        "rounded-2xl h-full w-full p-4 overflow-hidden",
        "bg-neutral-900", // Dark background for the card itself
        "border border-neutral-800/80", // Subtle border
        "dark:border-neutral-800/80", // Explicit dark border
        "group-hover:border-neutral-700", // Border change on hover of parent link
        "relative z-20", // Ensure content is above the hover effect span
        className
      )}
    >
      <div className="relative z-50"> {/* Ensure content inside is above effects */}
        <div className="p-2 md:p-4"> {/* Inner padding for content */}
            {children}
        </div>
      </div>
    </div>
  );
};

// CardTitle Component: For styling the title within a Card
export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn(
        "text-neutral-100 font-bold tracking-wide mt-2 text-lg md:text-xl", // Adjusted text size/margin
         className
        )}>
      {children}
    </h4>
  );
};

// CardDescription Component: For styling the description within a Card
export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p className={cn(
        "mt-2 text-neutral-400 tracking-wide leading-relaxed text-sm", // Adjusted margin
        className
        )}>
      {children}
    </p>
  );
};


// HoverEffect Component: Manages state and renders the grid with hover animation
export const HoverEffect = ({
  items,
  className,
}: {
  items: HoverCardItem[]; // Use the defined type
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null); // State for hovered card index

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-6 md:py-10", // Grid layout, adjusted padding
        className
      )}
    >
      {items.map((item, idx) => {
        const cardContent = item.content ? item.content : ( // Prioritize custom content
            <>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
            </>
        );

        const WrapperElement = item.link ? Link : 'div'; // Use Link if link exists, else div

        return (
            <WrapperElement
              href={item.link || '#'} // Use link or fallback
              key={item.id || item.title + idx} // Use id or title+index for key
              className="relative group block p-2 h-full w-full" // Link/wrapper takes up grid cell
              onMouseEnter={() => setHoveredIndex(idx)} // Set hover state on enter
              onMouseLeave={() => setHoveredIndex(null)} // Clear hover state on leave
              // Prevent link behavior if it's just a div
              onClick={(e) => { if (!item.link) e.preventDefault(); }}
              aria-label={item.title} // Accessibility
            >
              <AnimatePresence>
                {/* Render the animated background span only if this card is hovered */}
                {hoveredIndex === idx && (
                  <motion.span
                    className="absolute inset-0 h-full w-full bg-neutral-800/60 dark:bg-neutral-800/60 block rounded-3xl" // Background effect style
                    layoutId="hoverBackground" // Match layout animation ID
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.15 } }}
                    exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
                  />
                )}
              </AnimatePresence>
              {/* Render the actual Card component */}
              <Card>
                 {cardContent}
              </Card>
            </WrapperElement>
        );
      })}
    </div>
  );
};