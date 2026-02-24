// src/components/ui/calendar.tsx
"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { CalendarDropdown } from "./calendar-dropdown"; // Import the custom dropdown

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const currentYear = new Date().getFullYear();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-neutral-950 rounded-md", className)}
      captionLayout="dropdown-buttons"
      fromYear={currentYear - 120}
      toYear={currentYear + 5}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between items-center px-1 pt-1 h-10 relative mb-2",
        caption_label: "hidden",
        caption_dropdowns: "flex gap-1.5 items-center flex-shrink-0",
        nav: "flex items-center gap-1 flex-shrink-0",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-md hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 transition-colors"
        ),
        table: "w-full border-collapse space-y-1 mt-2",
        head_row: "flex justify-around",
        head_cell: "text-neutral-400 rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-1.5 justify-around",
        cell: "h-8 w-8 text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-neutral-800/80",
        day: cn(
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:ring-offset-1 focus:ring-offset-neutral-950 transition-colors"
        ),
        day_selected:"bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-600",
        day_today: "bg-neutral-700 text-neutral-100 rounded-md font-semibold",
        day_outside: "text-neutral-600 opacity-50",
        day_disabled: "text-neutral-700 opacity-40 cursor-not-allowed",
        day_range_middle:"aria-selected:bg-neutral-700/50 aria-selected:text-neutral-100",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Dropdown: CalendarDropdown, // Use the custom dropdown component
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };