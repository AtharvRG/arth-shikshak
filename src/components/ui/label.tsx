// src/components/ui/label.tsx
"use client";
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label"; // Use Radix for accessibility
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium text-neutral-300 dark:text-neutral-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", // Style for dark theme
      className
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };