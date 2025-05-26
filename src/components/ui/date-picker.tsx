// src/components/ui/date-picker.tsx
"use client";
import * as React from "react";
import { format, parse, isValid, isMatch } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date | undefined | null;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  inputClassName?: string;
  calendarClassName?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
}

const INPUT_DATE_FORMAT = "dd/MM/yyyy"; // Format for display and parsing

export function DatePicker({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  inputClassName,
  calendarClassName,
  disabled,
  required,
  id,
  name,
}: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState<string>(
    value instanceof Date && isValid(value) ? format(value, INPUT_DATE_FORMAT) : ""
  );
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  // Update input value only when the valid 'value' prop changes
  React.useEffect(() => {
    if (value instanceof Date && isValid(value)) {
      setInputValue(format(value, INPUT_DATE_FORMAT));
    } else if (!value) {
      setInputValue("");
    }
  }, [value]);

  // Handle typing in the input with auto-formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let typedValue = e.target.value;
    const digits = typedValue.replace(/\D/g, ""); // Keep only digits
    let formattedValue = "";

    if (digits.length > 0) formattedValue += digits.substring(0, 2);
    if (digits.length >= 3) formattedValue += "/" + digits.substring(2, 4);
    if (digits.length >= 5) formattedValue += "/" + digits.substring(4, 8);

    setInputValue(formattedValue); // Update display immediately

    // Try to parse and update parent state only if fully formed
    if (formattedValue.length === 10) {
        const parsedDate = parse(formattedValue, INPUT_DATE_FORMAT, new Date());
        if (isValid(parsedDate)) {
            if (!value || parsedDate.getTime() !== value.getTime()) {
                onChange(parsedDate);
            }
        } else if (value) { // Clear parent state if typed value becomes invalid
             onChange(undefined);
        }
    } else if (typedValue === "" && value) { // Clear parent state if input cleared
        onChange(undefined);
    }
  };

  // Handle selecting from calendar
  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    onChange(selectedDate);
    setIsCalendarOpen(false);
  };

  // Ensure a valid Date object or undefined is passed to Calendar
  const calendarDateValue = value instanceof Date && isValid(value) ? value : undefined;

  return (
    <div className="relative flex items-center">
      <Input
        id={id}
        name={name}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        disabled={disabled}
        required={required}
        className={cn("pr-10 tabular-nums", inputClassName)}
        maxLength={10}
      />
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger // Removed asChild, button is the trigger
          disabled={disabled}
          className={cn(
              "absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
              disabled && "cursor-not-allowed opacity-50"
          )}
          type="button"
          aria-label="Open date picker"
        >
          <CalendarIcon className="h-5 w-5" />
        </PopoverTrigger>
        <PopoverContent className={cn("w-auto p-0 z-[100]", calendarClassName)} align="start">
          <Calendar
            mode="single"
            month={calendarDateValue}
            selected={calendarDateValue}
            onSelect={handleCalendarSelect}
            initialFocus
            disabled={(date) => date > new Date() || date < new Date("1920-01-01")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}