/**
 * @fileoverview 향상된 색상 스와치 컴포넌트
 * 
 * 색상을 시각적으로 표시하고 다양한 색상 코드 형식, 접근성 정보,
 * 색맹 시뮬레이션 등의 고급 기능을 제공하는 React 컴포넌트입니다.
 * 
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 * 
 * **주요 기능:**
 * - HEX, RGB, HSL 색상 코드 표시 및 복사
 * - WCAG 접근성 대비율 검사 및 표시
 * - 색맹 시뮬레이션 (적록색약, 청황색약 등)
 * - 즐겨찾기 기능 지원
 * - 반응형 카드 레이아웃
 * - 색상 밝기 기반 자동 텍스트 색상 조정
 * 
 * @example
 * ```typescript
 * const oceanBlue: HSLColor = { h: 200, s: 70, l: 50 };
 * 
 * <EnhancedColorSwatch
 *   color={oceanBlue}
 *   index={0}
 *   showDetails={true}
 *   showAccessibility={true}
 *   backgroundColor={{ h: 0, s: 0, l: 100 }}
 *   onToggleFavorite={(color) => console.log('Toggle favorite:', color)}
 *   isFavorite={false}
 * />
 * ```
 */

import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Toast } from '../ui/toast';
import { 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Heart,
  HeartIcon
} from 'lucide-react';

import { ColorTheory, AccessibilityChecker } from '../../algorithms';
import type { HSLColor } from '../../algorithms';
import { AccessibilityIndicator, ColorBlindSimulator } from '../magicui/accessibility-indicator';

/**
 * EnhancedColorSwatch 컴포넌트의 props 인터페이스
 * 
 * @interface EnhancedColorSwatchProps
 * @example
 * ```typescript
 * const props: EnhancedColorSwatchProps = {
 *   color: { h: 200, s: 70, l: 50 },
 *   index: 0,
 *   showDetails: true,
 *   showAccessibility: true,
 *   backgroundColor: { h: 0, s: 0, l: 100 },
 *   onToggleFavorite: (color) => {},
 *   isFavorite: false,
 *   className: 'custom-swatch'
 * };
 * ```
 */
interface EnhancedColorSwatchProps {
  /** 표시할 HSL 색상 */
  color: HSLColor;
  
  /** 색상 인덱스 (팔레트 내 순서) */
  index?: number;
  
  /** 상세 정보 표시 여부 (색상 코드, HSL 값 등) */
  showDetails?: boolean;
  
  /** 접근성 정보 표시 여부 (대비율, WCAG 레벨) */
  showAccessibility?: boolean;
  
  /** 배경색 (대비율 계산용) */
  backgroundColor?: HSLColor;
  
  /** 즐겨찾기 토글 콜백 함수 */
  onToggleFavorite?: (color: HSLColor) => void;
  
  /** 현재 즐겨찾기 상태 */
  isFavorite?: boolean;
  
  /** 추가 CSS 클래스명 */
  className?: string;
}

/**
 * 향상된 색상 스와치 컴포넌트
 * 
 * 색상을 카드 형태로 표시하며, 다양한 색상 형식 변환, 
 * 접근성 검사, 색맹 시뮬레이션 등의 고급 기능을 제공합니다.
 * 
 * @component
 * @param {EnhancedColorSwatchProps} props - 컴포넌트 props
 * @returns {JSX.Element} 색상 스와치 카드 컴포넌트
 */
export const EnhancedColorSwatch: React.FC<EnhancedColorSwatchProps> = ({
  color,
  index = 0,
  showDetails = true,
  showAccessibility = false,
  backgroundColor = { h: 0, s: 0, l: 100 },
  onToggleFavorite,
  isFavorite = false,
  className = ''
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [showColorBlind, setShowColorBlind] = useState<boolean>(false);
  const [showCopyToast, setShowCopyToast] = useState<boolean>(false);
  
  const colorTheory = new ColorTheory();
  const accessibilityChecker = new AccessibilityChecker();

  // 색상 형식 변환
  const hexColor = colorTheory.hslToHex(color);
  const rgbColor = colorTheory.hslToRgb(color);
  const hslString = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
  const rgbString = `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`;

  // 접근성 정보
  const contrastRatio = accessibilityChecker.calculateContrastRatio(color, backgroundColor);
  const contrastResult = accessibilityChecker.evaluateContrastLevel(contrastRatio, false);

  // 복사 기능
  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setShowCopyToast(true);
      setTimeout(() => {
        setCopiedFormat(null);
        setShowCopyToast(false);
      }, 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  // 색상 밝기에 따른 텍스트 색상 결정
  const getTextColor = () => {
    return color.l > 50 ? 'text-black' : 'text-white';
  };

  // 접근성 레벨 배지 색상
  const getAccessibilityBadgeColor = (level: string) => {
    switch (level) {
      case 'AAA': return 'bg-green-100 text-green-800 border-green-300';
      case 'AA': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'FAIL': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <TooltipProvider>
      <Card 
        className={`overflow-hidden transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        data-testid="color-card"
        data-color={hexColor}
        role="button"
        aria-label={`색상 ${hexColor}, 클릭하여 복사`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            copyToClipboard(hexColor, 'HEX');
          }
        }}
        onClick={() => copyToClipboard(hexColor, 'HEX')}
      >
        {/* 메인 색상 영역 */}
        <div 
          className="h-32 relative group cursor-pointer transition-transform hover:scale-105"
          style={{ backgroundColor: hexColor }}
        >
          {/* 색상 인덱스 */}
          {index !== undefined && (
            <div className={`absolute top-2 left-2 ${getTextColor()}`}>
              <Badge variant="outline" className="bg-white bg-opacity-80 text-xs">
                #{index + 1}
              </Badge>
            </div>
          )}

          {/* 즐겨찾기 버튼 */}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 right-2 ${getTextColor()} hover:bg-white hover:bg-opacity-20`}
              onClick={() => onToggleFavorite(color)}
            >
              {isFavorite ? (
                <Heart className="w-4 h-4 fill-current" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* 접근성 배지 */}
          {showAccessibility && (
            <div className="absolute bottom-2 right-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={getAccessibilityBadgeColor(contrastResult.level)}>
                    {contrastResult.level}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <div className="font-medium">대비율: {contrastRatio.toFixed(1)}:1</div>
                    <div className="text-xs">
                      {contrastResult.level === 'AAA' && '최상급 접근성'}
                      {contrastResult.level === 'AA' && '표준 접근성'}
                      {contrastResult.level === 'FAIL' && '접근성 개선 필요'}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* 색맹 시뮬레이션 토글 */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute bottom-2 left-2 ${getTextColor()} hover:bg-white hover:bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity`}
            onClick={() => setShowColorBlind(!showColorBlind)}
          >
            {showColorBlind ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>

        {/* 색상 정보 */}
        {showDetails && (
          <CardContent className="p-3 space-y-2">
            {/* 색상 코드 */}
            <div className="space-y-1">
              {/* HEX */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono font-medium">{hexColor.toUpperCase()}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(hexColor, 'HEX')}
                >
                  {copiedFormat === 'HEX' ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>

              {/* RGB */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="font-mono">{rgbString}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => copyToClipboard(rgbString, 'RGB')}
                >
                  {copiedFormat === 'RGB' ? (
                    <Check className="w-2.5 h-2.5 text-green-500" />
                  ) : (
                    <Copy className="w-2.5 h-2.5" />
                  )}
                </Button>
              </div>

              {/* HSL */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="font-mono">{hslString}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => copyToClipboard(hslString, 'HSL')}
                >
                  {copiedFormat === 'HSL' ? (
                    <Check className="w-2.5 h-2.5 text-green-500" />
                  ) : (
                    <Copy className="w-2.5 h-2.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* HSL 값 표시 */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-gray-500">H</div>
                <div className="font-medium">{Math.round(color.h)}°</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">S</div>
                <div className="font-medium">{Math.round(color.s)}%</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">L</div>
                <div className="font-medium">{Math.round(color.l)}%</div>
              </div>
            </div>

            {/* 접근성 세부 정보 */}
            {showAccessibility && (
              <AccessibilityIndicator
                contrastRatio={contrastRatio}
                level={contrastResult.level}
                className="mt-3"
              />
            )}

            {/* 색맹 시뮬레이션 */}
            {showColorBlind && (
              <div className="space-y-2 mt-3 p-2 bg-gray-50 rounded">
                <h4 className="text-xs font-medium text-gray-700">색맹 시뮬레이션</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['protanopia', 'deuteranopia', 'tritanopia', 'normal'].map((type) => (
                    <ColorBlindSimulator
                      key={type}
                      originalColor={hexColor}
                      type={type as any}
                      className="text-xs"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 복사 완료 메시지 */}
            {copiedFormat && (
              <div className="text-xs text-center text-green-600 font-medium">
                {copiedFormat} 복사됨!
              </div>
            )}
          </CardContent>
        )}
      </Card>
      
      {/* 복사 토스트 알림 */}
      {showCopyToast && (
        <Toast
          message={`${copiedFormat} 색상 코드가 복사되었습니다!`}
          type="success"
          duration={2000}
          onClose={() => setShowCopyToast(false)}
          data-testid="copy-toast"
        />
      )}
    </TooltipProvider>
  );
};