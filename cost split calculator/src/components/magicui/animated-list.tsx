"use client"

import React, { useEffect, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface AnimatedListProps {
  className?: string
  children: React.ReactNode
  delay?: number
  duration?: number
  staggerDelay?: number
}

const AnimatedList = React.forwardRef<
  HTMLDivElement,
  AnimatedListProps
>(({ className, children, delay = 0, duration = 0.4, staggerDelay = 0.1, ...props }, ref) => {
  const childrenArray = React.Children.toArray(children)

  const animations = useMemo(() => ({
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95
    }
  }), [])

  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      <AnimatePresence>
        {childrenArray.map((child, index) => (
          <motion.div
            key={index}
            initial={animations.initial}
            animate={animations.animate}
            exit={animations.exit}
            transition={{
              duration,
              delay: delay + (index * staggerDelay),
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
})

AnimatedList.displayName = "AnimatedList"

export interface AnimatedListItemProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  onRemove?: () => void
}

export const AnimatedListItem = React.forwardRef<
  HTMLDivElement,
  AnimatedListItemProps
>(({ className, children, onClick, onRemove, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "group relative p-4 bg-card border rounded-lg cursor-pointer transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
      {...props}
    >
      {children}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove item"
        >
          <svg
            className="h-4 w-4 text-muted-foreground hover:text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </motion.div>
  )
})

AnimatedListItem.displayName = "AnimatedListItem"

// OCR Result specific component
export interface OCRResultItemProps {
  item: string
  price: number
  isSelected?: boolean
  onSelect?: (item: string) => void
  onPriceChange?: (item: string, price: number) => void
  className?: string
}

export const OCRResultItem = React.forwardRef<
  HTMLDivElement,
  OCRResultItemProps
>(({ item, price, isSelected, onSelect, onPriceChange, className, ...props }, ref) => {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editPrice, setEditPrice] = React.useState(price.toString())

  const handlePriceSubmit = () => {
    const newPrice = parseFloat(editPrice) || 0
    onPriceChange?.(item, newPrice)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePriceSubmit()
    } else if (e.key === 'Escape') {
      setEditPrice(price.toString())
      setIsEditing(false)
    }
  }

  return (
    <AnimatedListItem
      ref={ref}
      className={cn(
        "flex items-center justify-between",
        isSelected && "ring-2 ring-primary bg-primary/5",
        className
      )}
      onClick={() => onSelect?.(item)}
      {...props}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item}</p>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        {isEditing ? (
          <input
            type="number"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            onBlur={handlePriceSubmit}
            onKeyDown={handleKeyDown}
            className="w-20 px-2 py-1 text-sm bg-background border rounded text-right"
            autoFocus
            step="0.01"
            min="0"
          />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            className="px-2 py-1 text-sm font-medium text-right hover:bg-accent rounded transition-colors"
            aria-label={`Edit price for ${item}`}
          >
            ₩{price.toLocaleString()}
          </button>
        )}
      </div>
    </AnimatedListItem>
  )
})

OCRResultItem.displayName = "OCRResultItem"

export { AnimatedList }