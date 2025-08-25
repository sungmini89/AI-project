"use client";

import { useEffect, useState } from "react";

interface SparklesTextProps {
  text: string;
  className?: string;
  sparklesCount?: number;
}

export function SparklesText({ 
  text, 
  className = "", 
  sparklesCount = 5 
}: SparklesTextProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles = Array.from({ length: sparklesCount }, (_, i) => ({
        id: i,
        style: {
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 2}s`,
        },
      }));
      setSparkles(newSparkles);
    };

    generateSparkles();
    const interval = setInterval(generateSparkles, 3000);
    return () => clearInterval(interval);
  }, [sparklesCount]);

  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="absolute w-1 h-1 bg-primary rounded-full animate-ping opacity-70"
          style={sparkle.style}
        />
      ))}
    </div>
  );
}