"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface AnimatedCircularProgressBarProps {
  /**
   * Current progress value.
   */
  value: number;
  /**
   * Maximum progress value.
   */
  max?: number;
  /**
   * Minimum progress value.
   */
  min?: number;
  /**
   * The color of the progress bar.
   */
  gaugePrimaryColor?: string;
  /**
   * The color of the background circle (not progressed).
   */
  gaugeSecondaryColor?: string;
  /**
   * Additional CSS class for styling.
   */
  className?: string;
}

export default function AnimatedCircularProgressBar({
  value = 0,
  min = 0,
  max = 100,
  gaugePrimaryColor = "rgb(79 70 229)", // indigo-600
  gaugeSecondaryColor = "rgb(229 231 235)", // gray-200
  className,
  ...rest
}: AnimatedCircularProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  const circumference = 2 * Math.PI * 45;
  const percentPx = circumference / 100;
  const currentPercent = ((displayValue - min) / (max - min)) * 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 250);
    
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div
      className={cn(
        "relative h-40 w-40 text-2xl font-semibold",
        className,
      )}
      {...rest}
    >
      <svg
        fill="none"
        shapeRendering="crispEdges"
        height="100%"
        width="100%"
        viewBox="0 0 100 100"
        strokeWidth={2}
      >
        <circle
          cx={50}
          cy={50}
          r={45}
          stroke={gaugeSecondaryColor}
          className="opacity-20"
        />
        <motion.circle
          cx={50}
          cy={50}
          r={45}
          stroke={gaugePrimaryColor}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          className="opacity-70"
          animate={{
            strokeDashoffset: circumference - currentPercent * percentPx,
          }}
          transition={{
            delay: 0.5,
            duration: 2,
            ease: "easeInOut",
          }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-black dark:text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          {Math.round(displayValue)}%
        </motion.p>
      </motion.div>
    </div>
  );
}