"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
}: {
  words: string;
  className?: string;
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" ");
  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
      },
      {
        duration: 2,
        delay: stagger(0.05), // Slightly faster stagger
      }
    );
  }, [scope.current]); // Re-run animation when scope changes (usually on mount)

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
<motion.span
  key={word + idx}
  // Ensure it uses a light color on dark backgrounds, remove explicit 'text-black'
  className="text-white dark:text-neutral-300 opacity-0" // Use neutral-300 for dark mode
>
  {word}{" "}
</motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-normal", className)}> {/* Use 'normal' font weight unless overridden */}
      <div className="mt-4">
        <div className=" dark:text-white text-black text-xl leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};