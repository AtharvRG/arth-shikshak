// src/components/ui/expandable-card.tsx
"use client";

import React, { useEffect, useId, useRef, useState, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FiArrowRight, FiX } from "react-icons/fi";

// Type definition
export type ExpandableCardData = {
  id: string;
  title: string;
  description: string;
  src?: string;
  previewContent?: React.ReactNode;
  previewActions?: React.ReactNode; // *** NEW PROP for actions on collapsed card ***
  ctaText?: string;
  ctaLink?: string;
  content: () => React.ReactNode;
  className?: string;
};
// Close Icon Component
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-neutral-800">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M18 6l-12 12" />
        <path d="M6 6l12 12" />
    </svg>
);

// Main component to render the grid and handle expansion
export function ExpandableCardGrid({ cards }: { cards: ExpandableCardData[] }) {
  const [active, setActive] = useState<ExpandableCardData | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setActive(null));
  const layoutIdPrefix = useId();

  // Effect for body overflow and Esc key
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") setActive(null); }
    if (active) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = "auto"; }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence> {active && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md h-full w-full z-40" /> )} </AnimatePresence>

       {/* Expanded Card Modal */}
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-50 p-4 md:p-8">
             {/* Close Button */}
             <motion.button key={`button-${active.id}`} layout initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
               className="flex absolute top-4 right-4 lg:top-6 lg:right-6 items-center justify-center bg-white hover:bg-neutral-200 transition-colors rounded-full h-7 w-7 z-[101] shadow-md"
               onClick={() => setActive(null)} aria-label="Close detail view" > <CloseIcon /> </motion.button>

             {/* Card Content */}
             <motion.div
                layoutId={`card-${active.id}-${layoutIdPrefix}`} ref={ref}
                className="w-full max-w-xl h-full md:h-auto md:max-h-[85vh] flex flex-col bg-neutral-900 shadow-2xl rounded-xl overflow-hidden border border-neutral-700/60"
             >
                {/* Header */}
                 <div className="flex justify-between items-start p-4 md:p-5 border-b border-neutral-800 flex-shrink-0 bg-neutral-800/30">
                     <div className="flex-1 pr-4">
                          <motion.h3 layoutId={`title-${active.id}-${layoutIdPrefix}`} className="font-semibold text-base md:text-lg text-neutral-100"> {active.title} </motion.h3>
                          {/* Description could optionally be shown here too if needed */}
                          {/* <motion.p layoutId={`description-${active.id}-${layoutIdPrefix}`} className="text-neutral-400 text-xs md:text-sm mt-1"> {active.description} </motion.p> */}
                     </div>
                      {/* Optional CTA Button */}
                      {active.ctaLink && active.ctaText && (
                          <motion.a layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} href={active.ctaLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-xs md:text-sm rounded-md font-medium bg-blue-600 text-white whitespace-nowrap hover:bg-blue-700 transition-colors flex-shrink-0"> {active.ctaText} </motion.a>
                      )}
                 </div>
                 {/* Scrollable Detailed Content */}
                 <div className="relative px-4 md:px-5 flex-1 overflow-y-auto [mask:linear-gradient(to_bottom,white_90%,transparent_100%)] [scrollbar-width:thin] scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                     <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-4 text-neutral-300 text-sm md:text-base">
                         {active.content()} {/* Render detailed content function */}
                     </motion.div>
                 </div>
             </motion.div>
           </div>
        ) : null}
      </AnimatePresence>

      {/* Grid of Collapsed Cards */}
      <ul className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 items-start gap-6 md:gap-8">
        {cards.map((card) => (
          <motion.li
            layoutId={`card-${card.id}-${layoutIdPrefix}`}
            key={card.id}
            onClick={(e) => {
                // Prevent expansion if clicking on an action button inside preview
                if ((e.target as HTMLElement).closest('[data-no-expand="true"]')) {
                    return;
                }
                setActive(card);
            }}
            className={cn(
                "relative p-5", // Base padding
                "bg-neutral-900",
                "rounded-xl", // Keep slightly less rounding than modal?
                "border border-neutral-800/80",
                "h-[260px] md:h-[280px]", // *** Fixed height ***
                "cursor-pointer",
                "hover:border-neutral-700 transition-colors duration-200",
                "flex flex-col", // Flex column layout
                "overflow-hidden", // Hide potential overflow in collapsed state
                card.className
                )}
          >
            {/* *** Action Button Slot (Top Right) *** */}
            {card.previewActions && (
                <div
                    className="absolute top-2 right-2 z-10 opacity-0 group-hover/collapsed_card:opacity-100 transition-opacity duration-200"
                    data-no-expand="true" // Prevent card expansion when clicking actions
                >
                    {card.previewActions}
                </div>
            )}
            {/* --- End Action Slot --- */}

            {/* Render custom preview content IF PROVIDED */}
            {card.previewContent ? (
                 card.previewContent
            ) : (
                 // Default Collapsed Card Content Structure
                 <div className="flex flex-col h-full">
                     <div className="flex-1 mb-4">
                         <motion.h3 layoutId={`title-${card.id}-${layoutIdPrefix}`} className="font-semibold text-lg md:text-xl text-neutral-100 mb-1"> {card.title} </motion.h3>
                         <motion.p layoutId={`description-${card.id}-${layoutIdPrefix}`} className="text-neutral-400 text-sm line-clamp-3"> {card.description} </motion.p>
                     </div>
                     <div className="mt-auto text-right"> <span className="text-xs text-neutral-500 group-hover:text-blue-400 flex items-center justify-end gap-1 transition-colors duration-200"> Expand <FiArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" /> </span> </div>
                 </div>
            )}
          </motion.li>
          // *** END UPDATED Collapsed Card Styling ***
        ))}
      </ul>
    </>
  );
}