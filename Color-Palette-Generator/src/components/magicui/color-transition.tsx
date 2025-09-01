import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorTransitionProps {
  colors: string[];
  duration?: number;
  className?: string;
}

/**
 * 색상 간 부드러운 전환 애니메이션 컴포넌트
 * 팔레트 생성 시 순차적으로 색상이 나타나는 효과 구현
 */
export const ColorTransition: React.FC<ColorTransitionProps> = ({
  colors,
  duration = 0.6,
  className = ''
}) => {
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  useEffect(() => {
    if (colors.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % colors.length);
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [colors, duration]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentColorIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{
            duration: duration * 0.8,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-lg"
          style={{
            backgroundColor: colors[currentColorIndex] || '#ffffff'
          }}
        />
      </AnimatePresence>
      
      {/* 색상 정보 오버레이 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-2 left-2 text-white text-xs font-mono bg-black bg-opacity-40 px-2 py-1 rounded"
      >
        {colors[currentColorIndex]?.toUpperCase()}
      </motion.div>
    </div>
  );
};

interface PaletteRevealProps {
  colors: string[];
  isGenerating?: boolean;
  className?: string;
}

/**
 * 팔레트 생성 시 순차적으로 색상이 등장하는 애니메이션
 */
export const PaletteReveal: React.FC<PaletteRevealProps> = ({
  colors,
  isGenerating = false,
  className = ''
}) => {
  const [visibleColors, setVisibleColors] = useState<number>(0);

  useEffect(() => {
    if (isGenerating) {
      setVisibleColors(0);
      return;
    }

    if (colors.length === 0) return;

    let index = 0;
    const showNextColor = () => {
      if (index < colors.length) {
        setVisibleColors(index + 1);
        index++;
        setTimeout(showNextColor, 200);
      }
    };

    const timer = setTimeout(showNextColor, 100);
    return () => clearTimeout(timer);
  }, [colors, isGenerating]);

  if (isGenerating) {
    return (
      <div className={`flex space-x-2 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-16 h-16 rounded-lg bg-gray-200"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex space-x-2 ${className}`}>
      {colors.map((color, index) => (
        <motion.div
          key={`${color}-${index}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: index < visibleColors ? 1 : 0,
            opacity: index < visibleColors ? 1 : 0
          }}
          transition={{
            duration: 0.4,
            ease: "backOut"
          }}
          className="w-16 h-16 rounded-lg shadow-md relative overflow-hidden"
          style={{ backgroundColor: color }}
          data-testid="color-card"
          role="button"
          aria-label={`색상 ${color.toUpperCase()}`}
          tabIndex={0}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: index < visibleColors ? "0%" : "100%" }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center font-mono"
            data-testid="color-hex"
          >
            {color.toUpperCase()}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};