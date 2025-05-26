// src/components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-neutral-800 dark:border-neutral-800", // Dark theme border
          "bg-neutral-950 dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-100 dark:text-neutral-100", // Dark theme bg & text
          "ring-offset-black dark:ring-offset-black", // Dark theme focus ring offset
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-neutral-500 dark:placeholder:text-neutral-600", // Dark theme placeholder
          // Focus visible styles using blue for contrast
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className // Allow overriding styles
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };