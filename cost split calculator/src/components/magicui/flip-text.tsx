"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface FlipTextProps {
  children: React.ReactNode
  className?: string
  duration?: number
  direction?: "vertical" | "horizontal"
  staggerChildren?: number
  repeat?: boolean
  repeatDelay?: number
}

const FlipText = React.forwardRef<HTMLDivElement, FlipTextProps>(
  (
    {
      children,
      className,
      duration = 0.5,
      direction = "vertical",
      staggerChildren = 0.05,
      repeat = false,
      repeatDelay = 2,
      ...props
    },
    ref
  ) => {
    const [key, setKey] = useState(0)

    useEffect(() => {
      if (repeat) {
        const interval = setInterval(() => {
          setKey(prev => prev + 1)
        }, (duration + repeatDelay) * 1000)

        return () => clearInterval(interval)
      }
    }, [repeat, duration, repeatDelay])

    const text = typeof children === 'string' ? children : String(children)
    const letters = text.split('')

    const variants = {
      vertical: {
        initial: { rotateX: -90, opacity: 0 },
        animate: { rotateX: 0, opacity: 1 },
        exit: { rotateX: 90, opacity: 0 }
      },
      horizontal: {
        initial: { rotateY: -90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1 },
        exit: { rotateY: 90, opacity: 0 }
      }
    }

    return (
      <div 
        ref={ref}
        className={cn("inline-block", className)} 
        style={{ perspective: "1000px" }}
        {...props}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            className="inline-block"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={{
              animate: {
                transition: {
                  staggerChildren,
                }
              }
            }}
          >
            {letters.map((letter, index) => (
              <motion.span
                key={index}
                className="inline-block"
                variants={variants[direction]}
                transition={{
                  duration,
                  ease: [0.22, 1, 0.36, 1]
                }}
                style={{
                  transformOrigin: direction === "vertical" ? "50% 50% -50px" : "50% 50% -50px"
                }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }
)

FlipText.displayName = "FlipText"

// Text transition component for changing between different texts
export interface TextTransitionProps {
  texts: string[]
  currentIndex: number
  className?: string
  duration?: number
  direction?: "vertical" | "horizontal"
  loop?: boolean
  autoPlay?: boolean
  interval?: number
  onComplete?: (index: number) => void
}

const TextTransition = React.forwardRef<HTMLDivElement, TextTransitionProps>(
  (
    {
      texts,
      currentIndex,
      className,
      duration = 0.5,
      direction = "vertical",
      loop = false,
      autoPlay = false,
      interval = 3000,
      onComplete,
      ...props
    },
    ref
  ) => {
    const [internalIndex, setInternalIndex] = useState(currentIndex)

    useEffect(() => {
      setInternalIndex(currentIndex)
    }, [currentIndex])

    useEffect(() => {
      if (autoPlay && texts.length > 1) {
        const timer = setInterval(() => {
          setInternalIndex(prev => {
            const nextIndex = (prev + 1) % texts.length
            if (nextIndex === 0 && !loop) {
              return prev
            }
            onComplete?.(nextIndex)
            return nextIndex
          })
        }, interval)

        return () => clearInterval(timer)
      }
    }, [autoPlay, texts.length, interval, loop, onComplete])

    const currentText = texts[internalIndex] || ""

    const variants = {
      vertical: {
        initial: { y: 50, opacity: 0, rotateX: -45 },
        animate: { y: 0, opacity: 1, rotateX: 0 },
        exit: { y: -50, opacity: 0, rotateX: 45 }
      },
      horizontal: {
        initial: { x: 50, opacity: 0, rotateY: -45 },
        animate: { x: 0, opacity: 1, rotateY: 0 },
        exit: { x: -50, opacity: 0, rotateY: 45 }
      }
    }

    return (
      <div
        ref={ref}
        className={cn("relative inline-block", className)}
        style={{ perspective: "1000px" }}
        {...props}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={internalIndex}
            variants={variants[direction]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="inline-block"
            onAnimationComplete={() => onComplete?.(internalIndex)}
          >
            {currentText}
          </motion.span>
        </AnimatePresence>
      </div>
    )
  }
)

TextTransition.displayName = "TextTransition"

// OCR Status flip text component
export interface OCRStatusFlipProps {
  status: "idle" | "uploading" | "processing" | "analyzing" | "complete" | "error"
  className?: string
  showIcon?: boolean
}

const OCRStatusFlip = React.forwardRef<HTMLDivElement, OCRStatusFlipProps>(
  ({ status, className, showIcon = true, ...props }, ref) => {
    const statusConfig = {
      idle: {
        text: "영수증을 업로드해주세요",
        icon: "📁",
        color: "text-muted-foreground"
      },
      uploading: {
        text: "이미지 업로드 중...",
        icon: "⬆️",
        color: "text-blue-600"
      },
      processing: {
        text: "OCR 처리 중...",
        icon: "⚙️",
        color: "text-purple-600"
      },
      analyzing: {
        text: "텍스트 분석 중...",
        icon: "🔍",
        color: "text-cyan-600"
      },
      complete: {
        text: "분석 완료!",
        icon: "✅",
        color: "text-green-600"
      },
      error: {
        text: "오류가 발생했습니다",
        icon: "❌",
        color: "text-red-600"
      }
    }

    const config = statusConfig[status]

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 transition-colors duration-300",
          config.color,
          className
        )}
        {...props}
      >
        {showIcon && (
          <motion.span
            key={`icon-${status}`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="text-lg"
          >
            {config.icon}
          </motion.span>
        )}
        
        <TextTransition
          texts={[config.text]}
          currentIndex={0}
          duration={0.4}
          direction="vertical"
          className="font-medium"
        />
      </div>
    )
  }
)

OCRStatusFlip.displayName = "OCRStatusFlip"

// Word-by-word flip animation
export interface WordFlipProps {
  children: string
  className?: string
  duration?: number
  staggerDelay?: number
  direction?: "vertical" | "horizontal"
}

const WordFlip = React.forwardRef<HTMLDivElement, WordFlipProps>(
  (
    {
      children,
      className,
      duration = 0.5,
      staggerDelay = 0.1,
      direction = "vertical",
      ...props
    },
    ref
  ) => {
    const words = children.split(' ')

    const variants = {
      vertical: {
        initial: { y: 40, opacity: 0, rotateX: -90 },
        animate: { y: 0, opacity: 1, rotateX: 0 },
        exit: { y: -40, opacity: 0, rotateX: 90 }
      },
      horizontal: {
        initial: { x: 40, opacity: 0, rotateY: -90 },
        animate: { x: 0, opacity: 1, rotateY: 0 },
        exit: { x: -40, opacity: 0, rotateY: 90 }
      }
    }

    return (
      <div
        ref={ref}
        className={cn("inline-block", className)}
        style={{ perspective: "1000px" }}
        {...props}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            className="inline-block mr-2 last:mr-0"
            variants={variants[direction]}
            initial="initial"
            animate="animate"
            transition={{
              duration,
              delay: index * staggerDelay,
              ease: [0.22, 1, 0.36, 1]
            }}
            style={{
              transformOrigin: direction === "vertical" ? "50% 100%" : "0% 50%"
            }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    )
  }
)

WordFlip.displayName = "WordFlip"

// Typing effect with flip animation
export interface TypingFlipProps {
  text: string
  className?: string
  typingSpeed?: number
  flipDuration?: number
  cursor?: boolean
  onComplete?: () => void
}

const TypingFlip = React.forwardRef<HTMLDivElement, TypingFlipProps>(
  (
    {
      text,
      className,
      typingSpeed = 100,
      flipDuration = 0.3,
      cursor = true,
      onComplete,
      ...props
    },
    ref
  ) => {
    const [displayedText, setDisplayedText] = useState("")
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setDisplayedText(prev => prev + text[currentIndex])
          setCurrentIndex(prev => prev + 1)
        }, typingSpeed)

        return () => clearTimeout(timer)
      } else {
        onComplete?.()
      }
    }, [currentIndex, text, typingSpeed, onComplete])

    return (
      <div ref={ref} className={cn("inline-block", className)} {...props}>
        <FlipText duration={flipDuration} staggerChildren={0.02}>
          {displayedText}
        </FlipText>
        {cursor && currentIndex <= text.length && (
          <motion.span
            className="inline-block w-0.5 h-5 bg-current ml-1"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </div>
    )
  }
)

TypingFlip.displayName = "TypingFlip"

export { FlipText, TextTransition, OCRStatusFlip, WordFlip, TypingFlip }