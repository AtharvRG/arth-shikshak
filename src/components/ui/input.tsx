// src/components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

// Function to format number with Indian commas
const formatIndianNumber = (value: string): string => {
  if (!value) return "";
  // Allow digits and at most one decimal point
  value = String(value).replace(/[^0-9.]/g, "");
  const parts = value.split(".");
  let integerPart = parts[0];
  // Ensure there's at most one decimal part
  const decimalPart = parts[1] ? "." + parts.slice(1).join("") : "";

  // Remove leading zeros from integer part unless it's '0'
  integerPart = integerPart.replace(/^0+(?!$)/, "");
  if (integerPart === "" && decimalPart !== "") {
    integerPart = "0"; // Handle cases like ".123"
  } else if (integerPart === "") {
    return ""; // Handle empty input after cleaning
  }

  // Apply Indian comma formatting to the integer part
  if (integerPart.length > 3) {
    let lastThree = integerPart.substring(integerPart.length - 3);
    let otherNumbers = integerPart.substring(0, integerPart.length - 3);
    otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    integerPart = otherNumbers + "," + lastThree;
  }

  // Combine integer and decimal parts
  return integerPart + decimalPart;
};

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Add a custom type for Indian number formatting
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"] | "indian-number";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onChange, ...props }, ref) => {
    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        let { value } = event.target;
        let unformattedValue = value.replace(/[^0-9.]/g, ""); // Get unformatted value

        if (type === "indian-number") {
          // Store cursor position relative to unformatted value
          const cursor = event.target.selectionStart || 0;
          const oldValue = event.target.value;
          const oldUnformattedValue = oldValue.replace(/[^0-9.]/g, "");
          const charsBeforeCursor = oldValue.substring(0, cursor);
          const unformattedCharsBeforeCursor = charsBeforeCursor.replace(
            /[^0-9.]/g,
            ""
          );

          const formattedValue = formatIndianNumber(unformattedValue);

          // Calculate new cursor position
          const newCharsBeforeCursor = formattedValue.substring(
            0,
            formattedValue.indexOf(unformattedCharsBeforeCursor) +
              unformattedCharsBeforeCursor.length
          );
          const newCursor = newCharsBeforeCursor.length;

          // Update the input's display value
          event.target.value = formattedValue;

          // Restore cursor position on the next tick
          requestAnimationFrame(() => {
            event.target.selectionStart = event.target.selectionEnd = newCursor;
          });

           // Call the original onChange with an event object containing the unformatted value
            if (onChange) {
                 const unformattedEvent = { ...event,
                     target: { ...event.target, value: unformattedValue } as HTMLInputElement
                 };
                 onChange(unformattedEvent);
             }


        } else {
          // For other input types, just pass the event through
          if (onChange) {
            onChange(event);
          }
        }
      },
      [type, onChange] // Dependencies for useCallback
    );

    return (
      <input
        type={type === "indian-number" ? "text" : type} // Use text type for formatted input
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
        onChange={handleChange} // Use the custom handler
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };