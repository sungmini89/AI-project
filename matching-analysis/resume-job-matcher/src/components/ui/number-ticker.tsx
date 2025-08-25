"use client";

import { useEffect, useState } from "react";

interface NumberTickerProps {
  value: number;
  className?: string;
}

export function NumberTicker({ value, className = "" }: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const frameRate = 60;
    const totalFrames = duration / (1000 / frameRate);

    let currentFrame = 0;
    const timer = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(easeOut * value);
      
      setDisplayValue(currentValue);

      if (currentFrame >= totalFrames) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [value]);

  return <span className={className}>{displayValue}</span>;
}