"use client";
import React, { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Direction = "top" | "left" | "bottom" | "right";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button", // Default to button element
  duration = 1,
  clockwise = true,
  ...props
}: React.PropsWithChildren<
  {
    containerClassName?: string;
    className?: string;
    as?: React.ElementType; // Allow specifying element type
    duration?: number;
    clockwise?: boolean;
  } & React.HTMLAttributes<HTMLElement> // Pass down standard HTML attributes
>) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("top");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["top", "left", "bottom", "right"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex + 1) % directions.length
      : (currentIndex - 1 + directions.length) % directions.length;
    return directions[nextIndex];
  };

  const movingMap: Record<Direction, string> = {
    top: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
    left: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
    bottom:
      "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
    right:
      "radial-gradient(16.2% 41.1% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
  };

  const highlight =
    "radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)"; // Using a blueish highlight

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevDirection) => rotateDirection(prevDirection));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered]);
  return (
    <Tag
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex rounded-full border content-center bg-black/20 hover:bg-black/10 transition duration-500 dark:bg-white/20 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-auto text-white z-10 bg-black px-4 py-2 rounded-[inherit]",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          "flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        )}
        style={{
          filter: "blur(2px)", // Slightly softer blur
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div className="bg-black absolute z-1 flex-none inset-[2px] rounded-[100px]" />
    </Tag>
  );
}