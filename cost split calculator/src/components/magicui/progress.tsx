"use client"

import React, { useEffect, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ProgressProps {
  value: number
  max?: number
  className?: string
  showValue?: boolean
  label?: string
  variant?: "default" | "success" | "warning" | "error"
  animated?: boolean
  indeterminate?: boolean
  size?: "sm" | "md" | "lg"
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      className,
      showValue = false,
      label,
      variant = "default",
      animated = true,
      indeterminate = false,
      size = "md",
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(0)
    
    // Spring animation for progress value
    const springProgress = useSpring(0, { 
      stiffness: 100, 
      damping: 15,
      restDelta: 0.001
    })
    
    const progress = Math.min(Math.max(value, 0), max)
    const percentage = (progress / max) * 100

    useEffect(() => {
      if (animated && !indeterminate) {
        springProgress.set(percentage)
        
        // Update display value with animation
        const unsubscribe = springProgress.on("change", (latest) => {
          setDisplayValue(Math.round(latest))
        })
        
        return unsubscribe
      } else {
        setDisplayValue(percentage)
      }
    }, [percentage, springProgress, animated, indeterminate])

    const progressVariants = {
      default: "bg-primary",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      error: "bg-red-500"
    }

    const sizeClasses = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3"
    }

    const backgroundTransform = useTransform(
      springProgress,
      [0, 100],
      ["0%", "100%"]
    )

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-2">
            {label && (
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
            )}
            {showValue && (
              <motion.span 
                className="text-sm text-muted-foreground"
                key={displayValue}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {indeterminate ? "처리 중..." : `${displayValue}%`}
              </motion.span>
            )}
          </div>
        )}
        
        <div
          className={cn(
            "relative overflow-hidden rounded-full bg-secondary",
            sizeClasses[size]
          )}
        >
          {indeterminate ? (
            // Indeterminate animation
            <motion.div
              className={cn(
                "absolute top-0 h-full rounded-full",
                progressVariants[variant]
              )}
              style={{ width: "33%" }}
              animate={{
                x: ["-100%", "300%"]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ) : (
            // Determinate progress
            <motion.div
              className={cn(
                "h-full rounded-full transition-colors duration-200",
                progressVariants[variant]
              )}
              style={{
                width: animated ? backgroundTransform : `${percentage}%`
              }}
              initial={animated ? { width: "0%" } : undefined}
            />
          )}
          
          {/* Shimmer effect for enhanced visual feedback */}
          {animated && !indeterminate && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{ width: "30%" }}
              animate={{
                x: ["-30%", "130%"]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}
        </div>
      </div>
    )
  }
)

Progress.displayName = "Progress"

// OCR-specific progress component with stages
export interface OCRProgressProps extends Omit<ProgressProps, "value" | "label"> {
  stage: "uploading" | "processing" | "analyzing" | "complete" | "error"
  progress?: number
  className?: string
}

const OCRProgress = React.forwardRef<HTMLDivElement, OCRProgressProps>(
  ({ stage, progress, className, ...props }, ref) => {
    const stageLabels = {
      uploading: "이미지 업로드 중...",
      processing: "OCR 처리 중...",
      analyzing: "텍스트 분석 중...",
      complete: "완료",
      error: "오류 발생"
    }

    const stageValues = {
      uploading: progress ?? 25,
      processing: progress ?? 50,
      analyzing: progress ?? 75,
      complete: 100,
      error: 0
    }

    const stageVariants = {
      uploading: "default" as const,
      processing: "default" as const,
      analyzing: "default" as const,
      complete: "success" as const,
      error: "error" as const
    }

    return (
      <Progress
        ref={ref}
        value={stageValues[stage]}
        label={stageLabels[stage]}
        variant={stageVariants[stage]}
        showValue={stage !== "error"}
        indeterminate={stage === "processing" && progress === undefined}
        className={className}
        {...props}
      />
    )
  }
)

OCRProgress.displayName = "OCRProgress"

// Multi-step progress for complex workflows
export interface MultiStepProgressProps {
  steps: Array<{
    label: string
    status: "pending" | "active" | "complete" | "error"
  }>
  className?: string
}

const MultiStepProgress = React.forwardRef<HTMLDivElement, MultiStepProgressProps>(
  ({ steps, className }, ref) => {
    const completedSteps = steps.filter(step => step.status === "complete").length
    const totalSteps = steps.length
    const progress = (completedSteps / totalSteps) * 100

    return (
      <div ref={ref} className={cn("w-full", className)}>
        <Progress
          value={progress}
          className="mb-4"
          variant={steps.some(s => s.status === "error") ? "error" : "default"}
        />
        
        <div className="space-y-2">
          {steps.map((step, index) => {
            const statusIcons = {
              pending: (
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
              ),
              active: (
                <motion.div
                  className="w-4 h-4 rounded-full bg-primary"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ),
              complete: (
                <motion.div
                  className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              ),
              error: (
                <motion.div
                  className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              )
            }

            return (
              <motion.div
                key={index}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {statusIcons[step.status]}
                <span
                  className={cn(
                    "text-sm transition-colors",
                    step.status === "complete" && "text-green-600 font-medium",
                    step.status === "active" && "text-primary font-medium",
                    step.status === "error" && "text-red-600 font-medium",
                    step.status === "pending" && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }
)

MultiStepProgress.displayName = "MultiStepProgress"

export { Progress, OCRProgress, MultiStepProgress }