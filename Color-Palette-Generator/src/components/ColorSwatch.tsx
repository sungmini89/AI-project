import React from 'react';
import { ColorSwatch as ColorSwatchType } from '@/types/color';
import { cn } from '@/lib/utils';

interface ColorSwatchProps {
  color: ColorSwatchType;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: (color: ColorSwatchType) => void;
  className?: string;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  size = 'md',
  showDetails = true,
  onClick,
  className
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12', // 48px - meets accessibility requirements
    md: 'w-16 h-16', // 64px
    lg: 'w-24 h-24'  // 96px
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const handleCopy = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Add toast notification
      console.log(`Copied ${text} to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center gap-2 p-2 rounded-lg transition-all duration-200",
        onClick && "cursor-pointer hover:scale-105",
        className
      )}
      onClick={() => onClick?.(color)}
      data-testid="color-card"
      role="button"
      aria-label={`색상 ${color.hex}, RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`}
      tabIndex={onClick ? 0 : -1}
    >
      {/* Color Circle */}
      <div 
        className={cn(
          "rounded-full border-2 border-gray-200 shadow-sm transition-transform duration-200",
          sizeClasses[size],
          onClick && "hover:shadow-md"
        )}
        style={{ backgroundColor: color.hex }}
        aria-label={`Color swatch ${color.hex}`}
      />
      
      {/* Color Details */}
      {showDetails && (
        <div className="flex flex-col items-center gap-1 min-w-0">
          {color.name && (
            <span className={cn(
              "font-medium text-gray-900 truncate max-w-full",
              textSizeClasses[size]
            )}>
              {color.name}
            </span>
          )}
          
          <div className="flex flex-col items-center gap-0.5">
            {/* HEX */}
            <button
              onClick={(e) => handleCopy(color.hex, e)}
              className={cn(
                "font-mono text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-1 rounded transition-colors duration-200",
                textSizeClasses[size]
              )}
              title="Click to copy HEX"
            >
              {color.hex.toUpperCase()}
            </button>
            
            {/* RGB */}
            <button
              onClick={(e) => handleCopy(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, e)}
              className={cn(
                "font-mono text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-1 rounded text-xs transition-colors duration-200"
              )}
              title="Click to copy RGB"
            >
              RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
            </button>
            
            {/* HSL */}
            <button
              onClick={(e) => handleCopy(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`, e)}
              className={cn(
                "font-mono text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-1 rounded text-xs transition-colors duration-200"
              )}
              title="Click to copy HSL"
            >
              HSL({color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};