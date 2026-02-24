// src/components/ui/calendar-dropdown.tsx
import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DropdownProps } from 'react-day-picker';

// Reusable Select Components (can be moved to separate ui/select.tsx if preferred)
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-7 items-center justify-between rounded-md border border-transparent bg-transparent px-2 py-0 text-xs font-medium ring-offset-black placeholder:text-neutral-400 hover:bg-neutral-800 focus:bg-neutral-800 focus:border-blue-600 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
      "data-[placeholder]:text-neutral-300",
      className
    )}
    {...props}
  >
    {/* Ensure children passed here is a single element or Radix handles it */}
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-[100] max-h-60 min-w-[5rem] overflow-hidden rounded-md border border-neutral-700 bg-neutral-900 text-neutral-100 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-neutral-800 focus:text-neutral-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

// Custom Dropdown Component for react-day-picker
export function CalendarDropdown(props: DropdownProps) {
    const options = React.Children.toArray(
      props.children
    ) as React.ReactElement<React.HTMLProps<HTMLOptionElement>>[];

    const currentOption = options.find((option) => option.props.value === props.value);
    const currentValue = props.value?.toString();

    const handleChange = (value: string) => {
       const option = options.find((opt) => opt.props.value === value);
       if (props.onChange && option) {
            const syntheticEvent = { target: { value: value } } as React.ChangeEvent<HTMLSelectElement>;
            props.onChange(syntheticEvent);
       }
    };

    const ariaLabel = typeof props.caption === 'string' ? props.caption : 'Select value';

    return (
      <Select
        value={currentValue}
        onValueChange={handleChange}
      >
        <SelectTrigger
            aria-label={ariaLabel}
            className={cn( /* trigger styles */
              "h-7 rounded-md px-2 py-0 border border-transparent hover:bg-neutral-800 focus:bg-neutral-800 focus:border-blue-600 focus:ring-0 focus:outline-none",
              "text-xs font-medium flex-shrink-0 flex items-center gap-1",
              "data-[placeholder]:text-neutral-400"
            )}
        >
          {/* *** Approach 1: Wrap SelectValue in a span *** */}
          <span>
              <SelectValue placeholder={props.caption}>
                  {currentOption?.props.children ?? props.caption}
              </SelectValue>
          </span>
          {/* Keep default Radix icon behavior */}
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-60 overflow-y-auto z-[100]">
          {options.map((option) => (
            <SelectItem
              key={option.props.value?.toString()}
              value={option.props.value?.toString() ?? ""}
              disabled={option.props.disabled}
            >
              {option.props.children}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
}