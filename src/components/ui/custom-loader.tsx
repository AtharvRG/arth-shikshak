// src/components/ui/custom-loader.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface CustomLoaderProps {
  size?: string; // e.g., "w-10 h-10", "w-20 h-20"
}

const CustomLoader = ({ size = "w-12 h-12" }: CustomLoaderProps) => {
  return (
    // Wrapper to handle the blur effect container
    <div className={cn("relative", size)}>
      {/* The main rotating element */}
      <div
        className={cn(
          "absolute inset-0 animate-loader-spin", // Apply animation
           // Apply gradient background
          "bg-gradient-to-r from-[#fc00ff] to-[#00dbde]" // Adjusted gradient direction for better look maybe
        )}
      />
      {/* The ::before pseudo-element simulated with another div for blur */}
       <div
        className={cn(
          "absolute inset-0 scale-[0.90] blur-lg", // Scale down slightly and apply blur
          "bg-gradient-to-r from-[#fc00ff] to-[#00dbde]", // Same gradient
          "opacity-70" // Adjust opacity for blur intensity
        )}
      />
    </div>
  );
};

export default CustomLoader;