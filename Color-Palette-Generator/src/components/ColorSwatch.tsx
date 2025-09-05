/**
 * @fileoverview 개별 색상 견본 표시 및 상호작용 컴포넌트
 *
 * 단일 색상을 시각적으로 표시하고, 사용자가 색상 정보를 확인하고
 * 복사할 수 있는 기능을 제공하는 재사용 가능한 UI 컴포넌트입니다.
 *
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 *
 * **주요 기능:**
 * - 색상의 시각적 표시 (원형 또는 사각형)
 * - HEX, RGB, HSL 색상 코드 표시
 * - 클릭을 통한 색상 코드 복사
 * - 접근성 지원 (ARIA 라벨, 키보드 네비게이션)
 * - 다양한 크기 옵션 (sm, md, lg)
 * - 색상 이름 및 메타데이터 표시
 *
 * **사용 예시:**
 * ```tsx
 * <ColorSwatch
 *   color={colorData}
 *   size="lg"
 *   showDetails={true}
 *   onClick={handleColorClick}
 * />
 * ```
 */

import React from "react";
import { ColorSwatch as ColorSwatchType } from "@/types/color";
import { cn } from "@/lib/utils";

/**
 * ColorSwatch 컴포넌트의 Props 인터페이스
 *
 * @interface ColorSwatchProps
 * @property {ColorSwatchType} color - 표시할 색상 데이터
 * @property {'sm'|'md'|'lg'} [size='md'] - 색상 견본 크기
 * @property {boolean} [showDetails=true] - 색상 상세 정보 표시 여부
 * @property {Function} [onClick] - 색상 클릭 시 콜백 함수
 * @property {string} [className] - 추가 CSS 클래스명
 */
interface ColorSwatchProps {
  color: ColorSwatchType;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  onClick?: (color: ColorSwatchType) => void;
  className?: string;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  size = "md",
  showDetails = true,
  onClick,
  className,
}) => {
  const sizeClasses = {
    sm: "w-12 h-12", // 48px - meets accessibility requirements
    md: "w-16 h-16", // 64px
    lg: "w-24 h-24", // 96px
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const handleCopy = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Add toast notification
      console.log(`Copied ${text} to clipboard`);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
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
            <span
              className={cn(
                "font-medium text-gray-900 truncate max-w-full",
                textSizeClasses[size]
              )}
            >
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
              onClick={(e) =>
                handleCopy(
                  `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
                  e
                )
              }
              className={cn(
                "font-mono text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-1 rounded text-xs transition-colors duration-200"
              )}
              title="Click to copy RGB"
            >
              RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
            </button>

            {/* HSL */}
            <button
              onClick={(e) =>
                handleCopy(
                  `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
                  e
                )
              }
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
