// src/hooks/use-outside-click.ts
import React, { useEffect } from "react";

/**
 * Custom hook that triggers a callback when a click occurs outside the referenced element.
 * @param ref - A React ref object pointing to the element to monitor.
 * @param callback - The function to call when an outside click is detected.
 */
export const useOutsideClick = (
  ref: React.RefObject<HTMLElement>, // Generic HTMLElement ref
  callback: (event: MouseEvent | TouchEvent) => void // Callback function signature
) => {
  useEffect(() => {
    // Listener function to check if the click was outside
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if the ref isn't attached or the click is inside the ref element
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      // Call the provided callback function
      callback(event);
    };

    // Add event listeners for mousedown and touchstart
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    // Cleanup function to remove event listeners when the component unmounts or dependencies change
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]); // Re-run the effect if the ref or callback function changes
};