/**
 * Separator Component
 * A simple horizontal or vertical line separator
 */

import React from 'react'
import { cn } from '../../lib/utils'

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export const Separator: React.FC<SeparatorProps> = ({ 
  orientation = 'horizontal', 
  className 
}) => {
  return (
    <div
      role="separator"
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
    />
  )
}

export default Separator