// src/components/ui/select.tsx
"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { FiCheck, FiChevronDown } from "react-icons/fi"; // Using react-icons

import { cn } from "@/lib/utils"; // Your class merging utility

// Base Select component (Root)
const Select = SelectPrimitive.Root;

// Component to display the selected value or placeholder
const SelectValue = SelectPrimitive.Value;

// Trigger component (what the user clicks to open the dropdown)
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles for the trigger button
      "flex h-10 w-full items-center justify-between rounded-md border border-neutral-700 bg-neutral-800/60 px-3 py-2 text-sm text-neutral-100", // Dark theme styles
      "ring-offset-background placeholder:text-neutral-400", // Placeholder and ring styles
      "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-black", // Focus styles
      "disabled:cursor-not-allowed disabled:opacity-50", // Disabled styles
      "data-[placeholder]:text-neutral-400", // Style placeholder via data attribute
      className // Allow overriding/extending classes
    )}
    {...props}
  >
    {children} {/* This will render the SelectValue or placeholder */}
    <SelectPrimitive.Icon asChild>
      <FiChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName; // For DevTools

// Content component (the dropdown panel itself)
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        // Base styles for the dropdown panel
        "relative z-[100] max-h-60 min-w-[8rem] overflow-hidden rounded-md border border-neutral-700 bg-neutral-900 text-neutral-100 shadow-xl", // Dark theme, shadow, high z-index
        // Animation styles (using Tailwind CSS data attributes from Radix)
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        // Slide-in animations based on dropdown side
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        // Popper-specific positioning adjustments
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side-top]:-translate-y-1",
        className // Allow overriding/extending classes
      )}
      position={position}
      {...props}
    >
      {/* Viewport for scrollable content within the dropdown */}
      <SelectPrimitive.Viewport
        className={cn(
          "p-1", // Padding inside the viewport
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]" // Adjust size for popper
        )}
      >
        {children} {/* This will render SelectItem components */}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName; // For DevTools

// Label component (for grouping items, optional)
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold text-neutral-400", className)} // Dark theme label style
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName; // For DevTools

// Item component (each selectable option in the dropdown)
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      // Base styles for each item
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
      // Focus and hover styles for dark theme
      "focus:bg-neutral-800 focus:text-neutral-50 data-[highlighted]:bg-neutral-800 data-[highlighted]:text-neutral-50",
      // Disabled state styles
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className // Allow overriding/extending classes
    )}
    {...props}
  >
    {/* Checkmark indicator for selected item */}
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <FiCheck className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    {/* Text content of the item */}
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName; // For DevTools

// Separator component (optional, for dividing items)
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-neutral-700", className)} // Dark theme separator style
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName; // For DevTools

// Export all components
export {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};