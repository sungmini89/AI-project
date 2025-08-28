"use client";

import { motion, MotionProps } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FlipCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  isFlipped?: boolean;
  onFlip?: () => void;
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  flipDirection?: "horizontal" | "vertical";
  duration?: number;
}

export function FlipCard({
  children: _children,
  className,
  isFlipped = false,
  onFlip,
  frontContent,
  backContent,
  flipDirection = "horizontal",
  duration = 0.6,
  ...props
}: FlipCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const flipped = isFlipped !== undefined ? isFlipped : internalFlipped;

  const handleFlip = () => {
    if (onFlip) {
      onFlip();
    } else {
      setInternalFlipped(!internalFlipped);
    }
  };

  const rotateAxis = flipDirection === "horizontal" ? "rotateY" : "rotateX";

  return (
    <div 
      className={cn("relative w-full h-full perspective-1000", className)}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ [rotateAxis]: flipped ? 180 : 0 }}
        transition={{ duration, ease: "easeInOut" }}
        onClick={handleFlip}
        {...props}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {frontContent}
        </div>
        
        {/* Back of card */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            transform: flipDirection === "horizontal" ? "rotateY(180deg)" : "rotateX(180deg)"
          }}
        >
          {backContent}
        </div>
      </motion.div>
    </div>
  );
}

interface FlipCardSideProps {
  children: React.ReactNode;
  className?: string;
}

export function FlipCardFront({ children, className }: FlipCardSideProps) {
  return (
    <div className={cn("w-full h-full", className)}>
      {children}
    </div>
  );
}

export function FlipCardBack({ children, className }: FlipCardSideProps) {
  return (
    <div className={cn("w-full h-full", className)}>
      {children}
    </div>
  );
}