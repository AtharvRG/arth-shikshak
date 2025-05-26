// src/components/ui/placeholders-and-vanish-input.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion"; // Ensure correct import
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils"; // Assuming your utils file path

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  value: controlledValue, // Use controlled value prop
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (value: string) => void; // Passes submitted value back
  value: string; // The controlled value from the parent
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<any[]>([]);
  const [animating, setAnimating] = useState(false); // State to track animation

  // Logic to cycle through placeholders
  const startAnimation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholders.length]);

  // Handle tab visibility changes for placeholder animation
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible" && !animating) {
      startAnimation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAnimation, animating]);

  // Effect for placeholder animation and visibility changes
  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [placeholders, startAnimation, handleVisibilityChange]); // Ensure placeholders is a dependency if it could change

  // Logic to draw text onto the hidden canvas
  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(inputRef.current);
    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`; // Double font size for better particle resolution
    ctx.fillStyle = "#FFF"; // Color for drawing text pixels
    ctx.fillText(controlledValue, 16, 40); // Draw the current controlled value

    // Process pixel data to create particle array
    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData: any[] = [];
    for (let t = 0; t < 800; t++) {
      let i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        let e = i + 4 * n;
        if (pixelData[e] !== 0 && pixelData[e + 1] !== 0 && pixelData[e + 2] !== 0) {
          newData.push({ x: n, y: t, color: [pixelData[e], pixelData[e + 1], pixelData[e + 2], pixelData[e + 3]] });
        }
      }
    }
    // Store particle data in the ref
    newDataRef.current = newData.map(({ x, y, color }) => ({ x, y, r: 1, color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})` }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledValue]); // Redraw when the controlled input value changes

  // Redraw text whenever the input value changes
  useEffect(() => {
    draw();
  }, [controlledValue, draw]);

  // Function to trigger vanish animation and subsequent submit
  const vanishAndSubmit = () => {
    if (!inputRef.current || animating) return;
    const currentValue = controlledValue; // Get value from prop
    if (!currentValue) return;

    setAnimating(true); // Start animation state
    if (intervalRef.current) clearInterval(intervalRef.current); // Pause placeholder cycle

    draw(); // Ensure canvas has the current text drawn

    const maxX = newDataRef.current.reduce((prev, curr) => (curr.x > prev ? curr.x : prev), 0);

    // Start the animation, provide the callback to run on completion
    animate(maxX, () => {
      onSubmit(currentValue); // Call parent onSubmit with the value *after* animation
      setAnimating(false);    // Reset animation state
      startAnimation();       // Resume placeholder cycle
    });
  };

  // Vanish animation logic using requestAnimationFrame
  const animate = (start: number, onCompleteCallback?: () => void) => {
    const animateFrame = (pos: number = start) => { // Start clearing from the rightmost particle
      requestAnimationFrame(() => {
        const newArr = [];
        let particlesRemaining = false;
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) { // Keep particles to the left of the clearing position
            newArr.push(current);
          } else { // Process particles at or to the right of the clearing position
            if (current.r <= 0) { continue; } // Skip fully shrunk particles
            particlesRemaining = true;
            // Random movement and shrinking
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr; // Update particle array

        // Clear canvas area and redraw remaining particles
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos - 10, 0, 800, 800); // Clear area slightly behind the current position
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color: particleColor } = t; // Renamed color variable
            if (n > pos && s > 0) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = particleColor;
              ctx.fill();
            }
          });
        }

        // Continue animation or finish
        if (particlesRemaining && pos > -canvasRef.current!.width) { // Continue while particles exist & within bounds
           animateFrame(pos - 8); // Control animation speed here
        } else {
           // Animation finished
           newDataRef.current = [];
           const finalCtx = canvasRef.current?.getContext("2d");
           if (finalCtx) finalCtx.clearRect(0, 0, 800, 800); // Final clear
           onCompleteCallback?.(); // Execute the completion callback
        }
      });
    };
    animateFrame(); // Start the animation loop
  };

  // Handle Enter key press in input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !animating && controlledValue) {
      e.preventDefault(); // Prevent default form submission via Enter in input
      vanishAndSubmit();
    }
  };

  // Handle form submission (e.g., clicking the button)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    if (!animating && controlledValue) {
        vanishAndSubmit();
    }
  };

  // JSX Structure
  return (
    <form
      className={cn(
        "w-full relative max-w-xl mx-auto bg-white dark:bg-zinc-800 h-12 rounded-full overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200",
        controlledValue && "bg-gray-50 dark:bg-zinc-900" // Change background when input has value
      )}
      onSubmit={handleSubmit}
    >
      {/* Canvas for vanish effect */}
      <canvas
        className={cn(
          "absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left filter invert dark:invert-0 pr-20",
          !animating ? "opacity-0" : "opacity-100", // Show canvas only during animation
          "transition-opacity duration-500"
        )}
        ref={canvasRef}
      />
      {/* The actual text input */}
      <input
        onChange={onChange} // Pass parent's onChange
        onKeyDown={handleKeyDown}
        ref={inputRef}
        value={controlledValue} // Controlled value
        type="text"
        className={cn(
          "w-full relative text-sm sm:text-base z-50 border-none dark:text-white bg-transparent text-black h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-10 pr-20",
          animating && "text-transparent dark:text-transparent" // Hide text during animation
        )}
      />

      {/* Submit Button */}
      <button
        disabled={!controlledValue || animating} // Disable if empty or animating
        type="submit"
        aria-label="Submit"
        className="absolute right-2 top-1/2 z-50 -translate-y-1/2 h-8 w-8 rounded-full disabled:bg-gray-100 bg-black dark:bg-zinc-900 dark:disabled:bg-zinc-800 transition duration-200 flex items-center justify-center"
      >
        <motion.svg /* ... Arrow Icon SVG ... */ >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <motion.path d="M5 12l14 0" initial={{ strokeDasharray: "50%", strokeDashoffset: "50%" }} animate={{ strokeDashoffset: controlledValue ? 0 : "50%" }} transition={{ duration: 0.3, ease: "linear" }} />
            <path d="M13 18l6 -6" />
            <path d="M13 6l6 6" />
        </motion.svg>
      </button>

      {/* Placeholder Text Animation */}
      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
        <AnimatePresence mode="wait">
          {!controlledValue && !animating && ( // Show placeholder only when input is empty and not animating
            <motion.p
              initial={{ y: 5, opacity: 0 }}
              key={`current-placeholder-${currentPlaceholder}`}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: "linear" }}
              className="dark:text-zinc-500 text-sm sm:text-base font-normal text-neutral-500 pl-4 sm:pl-12 text-left w-[calc(100%-2rem)] truncate"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}