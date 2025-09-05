"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ShinyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  shimmerColor?: string
  shimmerDuration?: number
  shimmerDelay?: number
  loading?: boolean
  success?: boolean
}

const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      shimmerColor,
      shimmerDuration = 2,
      shimmerDelay = 0,
      loading = false,
      success = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false)

    const variants = {
      default:
        "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive",
      outline:
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary",
      ghost:
        "hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent",
      link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary"
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10"
    }

    const getShimmerColor = () => {
      if (shimmerColor) return shimmerColor
      if (success) return "#10b981"
      if (variant === "destructive") return "#ef4444"
      if (variant === "outline" || variant === "ghost" || variant === "secondary") return "#64748b"
      return "#ffffff"
    }

    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "overflow-hidden",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Background shimmer effect */}
        <motion.div
          className="absolute inset-0 opacity-0"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${getShimmerColor()}40 50%, transparent 70%)`,
          }}
          animate={
            isHovered && !disabled && !loading
              ? {
                  x: ["-200%", "200%"],
                  opacity: [0, 1, 0],
                }
              : { opacity: 0 }
          }
          transition={{
            duration: shimmerDuration,
            delay: shimmerDelay,
            ease: "easeInOut",
            repeat: isHovered ? Infinity : 0,
            repeatDelay: 0.5,
          }}
        />

        {/* Success shimmer effect */}
        {success && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(45deg, transparent 30%, ${getShimmerColor()}60 50%, transparent 70%)`,
            }}
            initial={{ x: "-200%", opacity: 0 }}
            animate={{
              x: ["200%", "-200%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {loading && (
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
          {success && !loading && (
            <motion.svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          )}
          {children}
        </span>

        {/* Ripple effect on click */}
        <motion.div
          className="absolute inset-0 rounded-[inherit]"
          initial={false}
          animate={
            isHovered
              ? {
                  boxShadow: [
                    "0 0 0 0px rgba(255,255,255,0.3)",
                    "0 0 0 8px rgba(255,255,255,0)",
                  ],
                }
              : {}
          }
          transition={{ duration: 0.4 }}
        />
      </button>
    )
  }
)

ShinyButton.displayName = "ShinyButton"

// OCR-specific button variants
export interface OCRButtonProps extends Omit<ShinyButtonProps, "children"> {
  action: "upload" | "process" | "analyze" | "calculate" | "reset"
  isActive?: boolean
  progress?: number
  children?: React.ReactNode
}

const OCRButton = React.forwardRef<HTMLButtonElement, OCRButtonProps>(
  ({ action, isActive = false, progress, children, ...props }, ref) => {
    const actionConfig = {
      upload: {
        shimmerColor: "#3b82f6",
        variant: "default" as const,
        defaultChildren: "영수증 업로드"
      },
      process: {
        shimmerColor: "#8b5cf6",
        variant: "secondary" as const,
        defaultChildren: "OCR 처리"
      },
      analyze: {
        shimmerColor: "#06b6d4",
        variant: "outline" as const,
        defaultChildren: "텍스트 분석"
      },
      calculate: {
        shimmerColor: "#10b981",
        variant: "default" as const,
        defaultChildren: "금액 계산"
      },
      reset: {
        shimmerColor: "#ef4444",
        variant: "destructive" as const,
        defaultChildren: "다시 시작"
      }
    }

    const config = actionConfig[action]

    return (
      <ShinyButton
        ref={ref}
        variant={config.variant}
        shimmerColor={config.shimmerColor}
        shimmerDuration={isActive ? 1.5 : 2}
        {...props}
      >
        {children || config.defaultChildren}
        {progress !== undefined && (
          <span className="ml-2 text-xs opacity-75">
            {Math.round(progress)}%
          </span>
        )}
      </ShinyButton>
    )
  }
)

OCRButton.displayName = "OCRButton"

// Pulsing variant for important actions
export interface PulsingShinyButtonProps extends ShinyButtonProps {
  pulse?: boolean
  pulseColor?: string
}

const PulsingShinyButton = React.forwardRef<HTMLButtonElement, PulsingShinyButtonProps>(
  ({ pulse = false, pulseColor, className, ...props }, ref) => {
    return (
      <motion.div
        className="relative"
        animate={
          pulse
            ? {
                boxShadow: [
                  `0 0 0 0px ${pulseColor || "rgba(59, 130, 246, 0.7)"}`,
                  `0 0 0 10px ${pulseColor || "rgba(59, 130, 246, 0)"}`,
                ],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: pulse ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <ShinyButton
          ref={ref}
          className={cn("relative z-10", className)}
          {...props}
        />
      </motion.div>
    )
  }
)

PulsingShinyButton.displayName = "PulsingShinyButton"

// Group of related shiny buttons
export interface ShinyButtonGroupProps {
  orientation?: "horizontal" | "vertical"
  className?: string
  children: React.ReactNode
}

const ShinyButtonGroup = React.forwardRef<HTMLDivElement, ShinyButtonGroupProps>(
  ({ orientation = "horizontal", className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-2",
          orientation === "vertical" ? "flex-col" : "flex-row",
          className
        )}
        role="group"
      >
        {children}
      </div>
    )
  }
)

ShinyButtonGroup.displayName = "ShinyButtonGroup"

export { ShinyButton, OCRButton, PulsingShinyButton, ShinyButtonGroup }