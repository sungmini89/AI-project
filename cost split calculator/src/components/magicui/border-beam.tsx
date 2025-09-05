"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface BorderBeamProps {
  className?: string
  size?: number
  duration?: number
  borderWidth?: number
  colorFrom?: string
  colorTo?: string
  delay?: number
  active?: boolean
  children?: React.ReactNode
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void
  onDragLeave?: (event: React.DragEvent<HTMLDivElement>) => void
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

const BorderBeam = React.forwardRef<HTMLDivElement, BorderBeamProps>(
  (
    {
      className,
      size = 200,
      duration = 15,
      borderWidth = 1.5,
      colorFrom = "#ffaa40",
      colorTo = "#9c40ff", 
      delay = 0,
      active = true,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-lg bg-background",
          className
        )}
        style={
          {
            "--border-beam-size": `${size}px`,
            "--border-beam-duration": `${duration}s`,
            "--border-beam-delay": `${delay}s`,
            "--border-width": `${borderWidth}px`,
            "--color-from": colorFrom,
            "--color-to": colorTo,
          } as React.CSSProperties
        }
        {...props}
      >
        {/* Border beam effect */}
        {active && (
          <>
            <motion.div
              className="absolute inset-0 rounded-[inherit]"
              style={{
                padding: `${borderWidth}px`,
                background: `linear-gradient(90deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "xor",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
              }}
              animate={{
                background: [
                  `linear-gradient(0deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
                  `linear-gradient(90deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
                  `linear-gradient(180deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
                  `linear-gradient(270deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
                  `linear-gradient(360deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
                ],
              }}
              transition={{
                duration,
                repeat: Infinity,
                ease: "linear",
                delay,
              }}
            />
            
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${colorFrom}40, transparent 60%)`,
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: duration / 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        )}
        
        {children && (
          <div className="relative z-10">
            {children}
          </div>
        )}
      </div>
    )
  }
)

BorderBeam.displayName = "BorderBeam"

// Upload area specific variant
export interface UploadBorderBeamProps extends Omit<BorderBeamProps, "active" | "onDrop" | "onDragOver" | "onDragLeave"> {
  isDragOver?: boolean
  isUploading?: boolean
  hasError?: boolean
  children?: React.ReactNode
  onDrop?: (files: FileList) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  accept?: string
  multiple?: boolean
  role?: string
  'aria-label'?: string
  'aria-describedby'?: string
  tabIndex?: number
}

const UploadBorderBeam = React.forwardRef<HTMLDivElement, UploadBorderBeamProps>(
  (
    {
      isDragOver = false,
      isUploading = false,
      hasError = false,
      children,
      onDrop,
      onDragOver,
      onDragLeave,
      accept,
      multiple = false,
      className,
      ...props
    },
    ref
  ) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      const files = e.dataTransfer.files
      if (files.length > 0) {
        onDrop?.(files)
      }
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onDragOver?.(e)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onDragLeave?.(e)
    }

    const handleClick = () => {
      fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        onDrop?.(files)
      }
    }

    const getBeamColors = () => {
      if (hasError) return { colorFrom: "#ef4444", colorTo: "#dc2626" }
      if (isUploading) return { colorFrom: "#3b82f6", colorTo: "#1d4ed8" }
      if (isDragOver) return { colorFrom: "#10b981", colorTo: "#059669" }
      return { colorFrom: "#ffaa40", colorTo: "#9c40ff" }
    }

    const { colorFrom, colorTo } = getBeamColors()

    return (
      <>
        <BorderBeam
          ref={ref}
          className={cn(
            "cursor-pointer transition-all duration-200",
            isDragOver && "scale-[1.02] shadow-lg",
            isUploading && "opacity-75 cursor-not-allowed",
            hasError && "border-red-200",
            className
          )}
          active={isDragOver || isUploading}
          colorFrom={colorFrom}
          colorTo={colorTo}
          duration={isUploading ? 2 : 15}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!isUploading ? handleClick : undefined}
          {...props}
        >
          {children}
          
          {/* Upload progress indicator */}
          {isUploading && (
            <motion.div
              className="absolute inset-0 bg-primary/5 flex items-center justify-center rounded-[inherit]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          )}
        </BorderBeam>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          aria-label="Upload file"
          data-testid="file-input"
        />
      </>
    )
  }
)

UploadBorderBeam.displayName = "UploadBorderBeam"

// Focused state variant for form elements
export interface FocusBorderBeamProps extends BorderBeamProps {
  isFocused?: boolean
  hasError?: boolean
  children: React.ReactNode
}

const FocusBorderBeam = React.forwardRef<HTMLDivElement, FocusBorderBeamProps>(
  ({ isFocused = false, hasError = false, children, ...props }, ref) => {
    const getColors = () => {
      if (hasError) return { colorFrom: "#ef4444", colorTo: "#dc2626" }
      return { colorFrom: "#3b82f6", colorTo: "#1d4ed8" }
    }

    const { colorFrom, colorTo } = getColors()

    return (
      <BorderBeam
        ref={ref}
        active={isFocused}
        colorFrom={colorFrom}
        colorTo={colorTo}
        duration={3}
        {...props}
      >
        {children}
      </BorderBeam>
    )
  }
)

FocusBorderBeam.displayName = "FocusBorderBeam"

export { BorderBeam, UploadBorderBeam, FocusBorderBeam }