"use client"

import React, { useEffect, useState } from "react"
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

export interface NumberTickerProps {
  value: number
  className?: string
  duration?: number
  prefix?: string
  suffix?: string
  decimalPlaces?: number
  locale?: string
  currency?: string
  direction?: "up" | "down"
  delay?: number
  onComplete?: () => void
}

const NumberTicker = React.forwardRef<HTMLSpanElement, NumberTickerProps>(
  (
    {
      value,
      className,
      duration = 2,
      prefix = "",
      suffix = "",
      decimalPlaces = 0,
      locale = "ko-KR",
      currency,
      direction = "up",
      delay = 0,
      onComplete,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(direction === "up" ? 0 : value)
    const springValue = useSpring(displayValue, {
      stiffness: 60,
      damping: 15,
      restDelta: 0.001
    })

    useEffect(() => {
      const timer = setTimeout(() => {
        springValue.set(value)
      }, delay * 1000)

      return () => clearTimeout(timer)
    }, [value, springValue, delay])

    useEffect(() => {
      const unsubscribe = springValue.on("change", (latest) => {
        setDisplayValue(latest)
      })

      const completeUnsubscribe = springValue.on("animationComplete", () => {
        onComplete?.()
      })

      return () => {
        unsubscribe()
        completeUnsubscribe()
      }
    }, [springValue, onComplete])

    const formatNumber = (num: number) => {
      if (currency) {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(num)
      }

      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(num)
    }

    return (
      <motion.span
        ref={ref}
        className={cn("font-mono tabular-nums", className)}
        initial={{ opacity: 0, y: direction === "up" ? 20 : -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        {...props}
      >
        {prefix}
        {formatNumber(displayValue)}
        {suffix}
      </motion.span>
    )
  }
)

NumberTicker.displayName = "NumberTicker"

// Individual digit ticker for more granular animation
export interface DigitTickerProps {
  digit: number
  className?: string
  duration?: number
  delay?: number
}

const DigitTicker = React.forwardRef<HTMLSpanElement, DigitTickerProps>(
  ({ digit, className, duration = 0.5, delay = 0 }, ref) => {
    const digits = Array.from({ length: 10 }, (_, i) => i)
    const y = useMotionValue(0)
    const digitHeight = 1.2 // em

    useEffect(() => {
      const timer = setTimeout(() => {
        y.set(-digit * digitHeight)
      }, delay * 1000)

      return () => clearTimeout(timer)
    }, [digit, y, delay])

    return (
      <span 
        ref={ref}
        className={cn("relative inline-block h-[1.2em] overflow-hidden", className)}
      >
        <motion.div
          style={{ y: useTransform(y, val => `${val}em`) }}
          transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        >
          {digits.map((d) => (
            <div key={d} className="h-[1.2em] flex items-center">
              {d}
            </div>
          ))}
        </motion.div>
      </span>
    )
  }
)

DigitTicker.displayName = "DigitTicker"

// Multi-digit ticker using individual digit animations
export interface MultiDigitTickerProps {
  value: number
  className?: string
  duration?: number
  staggerDelay?: number
  prefix?: string
  suffix?: string
}

const MultiDigitTicker = React.forwardRef<HTMLSpanElement, MultiDigitTickerProps>(
  ({ value, className, duration = 0.5, staggerDelay = 0.05, prefix = "", suffix = "" }, ref) => {
    const valueStr = Math.floor(Math.abs(value)).toString()
    const digits = valueStr.split("").map(Number)

    return (
      <span ref={ref} className={cn("font-mono", className)}>
        {value < 0 && "-"}
        {prefix}
        {digits.map((digit, index) => (
          <DigitTicker
            key={`${index}-${valueStr.length}`}
            digit={digit}
            duration={duration}
            delay={index * staggerDelay}
            className="inline-block"
          />
        ))}
        {suffix}
      </span>
    )
  }
)

MultiDigitTicker.displayName = "MultiDigitTicker"

// Cost-specific ticker for the OCR calculator
export interface CostTickerProps {
  amount: number
  currency?: string
  showComma?: boolean
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "success" | "warning" | "error"
  animated?: boolean
  duration?: number
}

const CostTicker = React.forwardRef<HTMLSpanElement, CostTickerProps>(
  (
    {
      amount,
      currency = "KRW",
      showComma = true,
      className,
      size = "md",
      variant = "default",
      animated = true,
      duration = 1.5,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
      setIsVisible(true)
    }, [])

    const sizeClasses = {
      sm: "text-sm",
      md: "text-lg",
      lg: "text-2xl",
      xl: "text-4xl"
    }

    const variantClasses = {
      default: "text-foreground",
      success: "text-green-600",
      warning: "text-yellow-600",
      error: "text-red-600"
    }

    const formatCurrency = (value: number) => {
      if (currency === "KRW") {
        return `₩${showComma ? value.toLocaleString("ko-KR") : value}`
      }
      
      return new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency,
      }).format(value)
    }

    return (
      <motion.div
        className="flex items-center gap-1"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {animated && isVisible ? (
          <NumberTicker
            ref={ref}
            value={amount}
            className={cn(
              "font-bold tabular-nums",
              sizeClasses[size],
              variantClasses[variant],
              className
            )}
            duration={duration}
            currency={currency}
            locale="ko-KR"
            {...props}
          />
        ) : (
          <span
            ref={ref}
            className={cn(
              "font-bold tabular-nums",
              sizeClasses[size],
              variantClasses[variant],
              className
            )}
          >
            {formatCurrency(amount)}
          </span>
        )}
      </motion.div>
    )
  }
)

CostTicker.displayName = "CostTicker"

// Split result ticker showing individual amounts
export interface SplitResultTickerProps {
  totalAmount: number
  splitCount: number
  currency?: string
  className?: string
  showPerPerson?: boolean
  animated?: boolean
}

const SplitResultTicker = React.forwardRef<HTMLDivElement, SplitResultTickerProps>(
  (
    {
      totalAmount,
      splitCount,
      currency = "KRW",
      className,
      showPerPerson = true,
      animated = true,
      ...props
    },
    ref
  ) => {
    const perPersonAmount = splitCount > 0 ? Math.ceil(totalAmount / splitCount) : 0

    return (
      <motion.div
        ref={ref}
        className={cn("space-y-2 p-4 bg-card rounded-lg border", className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        {...props}
      >
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">총 금액</span>
          <CostTicker
            amount={totalAmount}
            currency={currency}
            size="lg"
            variant="default"
            animated={animated}
            duration={1.2}
          />
        </div>

        {showPerPerson && splitCount > 0 && (
          <>
            <div className="border-t my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                인당 금액 ({splitCount}명)
              </span>
              <CostTicker
                amount={perPersonAmount}
                currency={currency}
                size="xl"
                variant="success"
                animated={animated}
                duration={2}
              />
            </div>
          </>
        )}
      </motion.div>
    )
  }
)

SplitResultTicker.displayName = "SplitResultTicker"

export { 
  NumberTicker, 
  DigitTicker, 
  MultiDigitTicker, 
  CostTicker, 
  SplitResultTicker 
}