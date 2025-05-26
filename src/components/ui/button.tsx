// src/components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot"; // For 'asChild' prop functionality
import { cva, type VariantProps } from "class-variance-authority"; // For managing style variants

import { cn } from "@/lib/utils"; // Your class merging utility

// Define button style variants using CVA
const buttonVariants = cva(
  // Base styles applied to all variants
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Define different visual styles
        default: "bg-blue-600 text-primary-foreground hover:bg-blue-700/90 shadow-md", // Primary action blue
        destructive: "bg-red-600 text-destructive-foreground hover:bg-red-700/90 shadow-md", // Destructive action red
        outline: "border border-neutral-700 bg-transparent hover:bg-neutral-800 hover:text-neutral-100", // Outline style
        secondary: "bg-neutral-700 text-secondary-foreground hover:bg-neutral-600/80", // Secondary action grey
        ghost: "hover:bg-neutral-800 hover:text-neutral-100", // Minimal ghost style
        link: "text-blue-400 underline-offset-4 hover:underline", // Link style
      },
      size: {
        // Define different size options
        default: "h-10 px-4 py-2", // Standard size
        sm: "h-9 rounded-md px-3", // Small size
        lg: "h-11 rounded-md px-8", // Large size
        icon: "h-9 w-9", // Icon button size
        xs: "h-7 rounded px-2 text-xs",
      },
    },
    // Default variant styles if not specified
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Define Button component props, extending standard button attributes and CVA variants
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean; // Allow rendering as a child element (e.g., wrapping a Link)
}

// Create the Button component using React.forwardRef
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Determine if the component should render as a Slot (wrapping its child) or a standard button
    const Comp = asChild ? Slot : "button";
    // Render the component, merging CVA variants with any passed className
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button"; // Set display name for DevTools

// Export the Button component and variants type
export { Button, buttonVariants };