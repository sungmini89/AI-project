/**
 * @fileoverview 색상 팔레트 표시 및 상호작용 컴포넌트
 *
 * 생성된 색상 팔레트를 시각적으로 표시하고, 사용자가 팔레트와 상호작용할 수 있는
 * 다양한 기능을 제공하는 핵심 UI 컴포넌트입니다.
 *
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 *
 * **주요 기능:**
 * - 색상 팔레트의 시각적 표시
 * - 접근성 점수 및 정보 표시
 * - 팔레트 복사, 저장, 공유, 내보내기 기능
 * - 색상 조화 유형별 라벨링
 * - 반응형 레이아웃 지원
 *
 * **사용 예시:**
 * ```tsx
 * <ColorPalette
 *   palette={generatedPalette}
 *   onSave={handleSave}
 *   onExport={handleExport}
 *   showActions={true}
 * />
 * ```
 */

import React from "react";
import { ColorPalette as ColorPaletteType, HarmonyType } from "@/types/color";
import { ColorSwatch } from "./ColorSwatch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Heart, Share, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ColorPalette 컴포넌트의 Props 인터페이스
 *
 * @interface ColorPaletteProps
 * @property {ColorPaletteType} palette - 표시할 색상 팔레트 데이터
 * @property {Function} [onSave] - 팔레트 저장 콜백 함수
 * @property {Function} [onExport] - 팔레트 내보내기 콜백 함수
 * @property {Function} [onShare] - 팔레트 공유 콜백 함수
 * @property {boolean} [showActions=true] - 액션 버튼 표시 여부
 * @property {string} [className] - 추가 CSS 클래스명
 */
interface ColorPaletteProps {
  palette: ColorPaletteType;
  onSave?: (palette: ColorPaletteType) => void;
  onExport?: (
    palette: ColorPaletteType,
    format: "png" | "svg" | "json" | "css"
  ) => void;
  onShare?: (palette: ColorPaletteType) => void;
  showActions?: boolean;
  className?: string;
}

const harmonyTypeLabels: Record<HarmonyType, string> = {
  complementary: "보색 조화",
  analogous: "유사색 조화",
  triadic: "3색 조화",
  tetradic: "4색 조화",
  monochromatic: "단색 조화",
};

const accessibilityScoreLabels = {
  excellent: { threshold: 0.8, label: "우수", color: "text-green-600" },
  good: { threshold: 0.6, label: "좋음", color: "text-blue-600" },
  fair: { threshold: 0.4, label: "보통", color: "text-yellow-600" },
  poor: { threshold: 0, label: "개선 필요", color: "text-red-600" },
};

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  palette,
  onSave,
  onExport,
  onShare,
  showActions = true,
  className,
}) => {
  const getAccessibilityLabel = (score: number) => {
    for (const [, config] of Object.entries(accessibilityScoreLabels)) {
      if (score >= config.threshold) {
        return config;
      }
    }
    return accessibilityScoreLabels.poor;
  };

  const accessibilityInfo = getAccessibilityLabel(palette.accessibilityScore);

  const handleCopyPalette = async () => {
    const hexColors = palette.colors.map((color) => color.hex).join(", ");
    try {
      await navigator.clipboard.writeText(hexColors);
      // TODO: Add toast notification
      console.log("Palette copied to clipboard");
    } catch (error) {
      console.error("Failed to copy palette:", error);
    }
  };

  const handleExportMenu = (format: "png" | "svg" | "json" | "css") => {
    onExport?.(palette, format);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              {palette.name ||
                `${harmonyTypeLabels[palette.harmonyType]} 팔레트`}
              {palette.source && (
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                  {palette.source}
                </span>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span>색상 {palette.colors.length}개</span>
              <span className="flex items-center gap-1">
                접근성 점수:
                <span className={cn("font-medium", accessibilityInfo.color)}>
                  {accessibilityInfo.label} (
                  {Math.round(palette.accessibilityScore * 100)}%)
                </span>
              </span>
              {palette.keyword && (
                <span className="text-blue-600">키워드: {palette.keyword}</span>
              )}
            </CardDescription>
          </div>

          {showActions && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyPalette}
                  title="팔레트 복사"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {onSave && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSave(palette)}
                    title="즐겨찾기에 저장"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                )}
                {onShare && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onShare(palette)}
                    title="공유"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                )}
                {onExport && (
                  <div className="relative group">
                    <Button variant="ghost" size="icon" title="내보내기">
                      <Download className="h-4 w-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <div className="py-1 min-w-[120px]">
                        <button
                          onClick={() => handleExportMenu("png")}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                        >
                          PNG 이미지
                        </button>
                        <button
                          onClick={() => handleExportMenu("svg")}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                        >
                          SVG 벡터
                        </button>
                        <button
                          onClick={() => handleExportMenu("css")}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                        >
                          CSS 변수
                        </button>
                        <button
                          onClick={() => handleExportMenu("json")}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                        >
                          JSON 데이터
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Color Swatches */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
          {palette.colors.map((color) => (
            <ColorSwatch
              key={color.id}
              color={color}
              size="lg"
              showDetails={true}
            />
          ))}
        </div>

        {/* Color Strip */}
        <div className="h-16 rounded-lg overflow-hidden shadow-inner mb-4">
          <div className="flex h-full">
            {palette.colors.map((color, index) => (
              <div
                key={color.id}
                className="flex-1 transition-all duration-300 hover:flex-[1.2]"
                style={{ backgroundColor: color.hex }}
                title={`${color.name || `Color ${index + 1}`}: ${color.hex}`}
              />
            ))}
          </div>
        </div>

        {/* Palette Info */}
        <div className="text-xs text-gray-500 flex justify-between items-center">
          <span>조화 유형: {harmonyTypeLabels[palette.harmonyType]}</span>
          {palette.createdAt && (
            <span>생성: {palette.createdAt.toLocaleDateString("ko-KR")}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
