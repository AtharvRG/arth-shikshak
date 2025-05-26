// src/components/layout/LoadingIndicator.tsx
"use client";

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLoading } from '@/context/LoadingContext';
import { Boxes } from '@/components/ui/background-boxes'; // Correct import
import CustomLoader from '@/components/ui/custom-loader';
import { cn } from '@/lib/utils';

export default function LoadingIndicator() {
  const { isLoading, loadingType, hints } = useLoading();

  const baseContainerClasses = "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden";
  const typeClasses = {
    fullPage: "bg-black/95 backdrop-blur-md", // Slightly darker bg, more blur
    popup: cn(
        "bg-black/80 backdrop-blur-lg", // Popup background
        "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "w-[90vw] max-w-md h-auto min-h-[200px] max-h-[60vh]",
        "rounded-xl border border-neutral-700 shadow-2xl"
    ),
  };
  const currentHint = hints[0] || "Loading...";

  return (
    <AnimatePresence>
      {isLoading && loadingType && (
        <motion.div
          key={loadingType} // Use type as key
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(baseContainerClasses, typeClasses[loadingType])}
          aria-live="assertive"
          aria-busy="true"
        >
          {/* Background Boxes - adjust opacity/positioning */}
          <Boxes className="absolute inset-0 w-full h-full opacity-20" /> {/* Reduced opacity */}

          {/* Content Wrapper */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-6">
             {/* Loader Animation */}
             <CustomLoader size={loadingType === 'popup' ? "w-10 h-10" : "w-16 h-16"} />

             {/* Cycling Hint Text */}
             <div className="mt-6 h-10 flex items-center justify-center">
                 <AnimatePresence mode="wait">
                     <motion.p
                         key={currentHint} // Animate when hint changes
                         initial={{ y: 10, opacity: 0 }}
                         animate={{ y: 0, opacity: 1 }}
                         exit={{ y: -10, opacity: 0 }}
                         transition={{ duration: 0.3 }}
                         className={cn(
                             "font-medium text-neutral-200",
                             loadingType === 'popup' ? "text-sm max-w-[80%]" : "text-base max-w-sm"
                         )}
                     >
                         {currentHint}
                     </motion.p>
                 </AnimatePresence>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}