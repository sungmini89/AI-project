"use client";

import { useEffect, useState } from "react";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export function Meteors({ number = 20, className = "" }: MeteorsProps) {
  const [meteors, setMeteors] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    const generateMeteors = () => {
      const newMeteors = Array.from({ length: number }, (_, i) => ({
        id: i,
        style: {
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${2 + Math.random() * 3}s`,
        },
      }));
      setMeteors(newMeteors);
    };

    generateMeteors();
    const interval = setInterval(generateMeteors, 8000);
    return () => clearInterval(interval);
  }, [number]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {meteors.map((meteor) => (
        <div
          key={meteor.id}
          className="absolute w-1 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-meteor"
          style={meteor.style}
        />
      ))}
    </div>
  );
}