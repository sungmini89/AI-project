/**
 * 이미지 색상 추출 페이지
 * Vibrant.js를 활용한 이미지 기반 팔레트 생성
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  Download, 
  Palette, 
  Settings,
  Trash2,
  Copy,
  Save,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import Vibrant from 'node-vibrant';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Slider } from '../components/ui/slider';
import type { HSLColor, ColorSwatch } from '../types/color';

interface ExtractedColor {
  name: string;
  color: string;
  population: number;
  hsl: HSLColor;
}

interface ExtractionSettings {
  quality: number;
  maxColors: number;
  minPopulation: number;
  ignoreWhite: boolean;
  ignoreBlack: boolean;
}

const ImageExtractPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string>('');
  const [settings, setSettings] = useState<ExtractionSettings>({
    quality: 10,
    maxColors: 8,
    minPopulation: 50,
    ignoreWhite: true,
    ignoreBlack: true
  });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 이미지 파일 처리
  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setExtractionError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB 제한
      setExtractionError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setSelectedImage(file);
    setExtractionError('');
    
    // 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // 드래그 앤 드롭 처리
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageSelect(files[0]);
    }
  }, [handleImageSelect]);

  // 파일 선택기 열기
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // RGB를 HSL로 변환
  const rgbToHsl = (r: number, g: number, b: number): HSLColor => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // 색상 추출 실행
  const extractColors = async () => {
    if (!selectedImage || !imagePreview) {
      setExtractionError('이미지를 먼저 선택해주세요.');
      return;
    }

    setIsExtracting(true);
    setExtractionError('');
    
    try {
      // Vibrant 옵션 설정
      // const options = {
      //   quality: settings.quality,
      //   maxSwatches: settings.maxColors
      // };

      // 이미지에서 색상 추출
      const palette = await Vibrant.from(imagePreview).getPalette();
      
      const colors: ExtractedColor[] = [];
      
      // Vibrant 팔레트 처리
      Object.entries(palette).forEach(([name, swatch]) => {
        if (swatch && swatch.population >= settings.minPopulation) {
          const [r, g, b] = swatch.rgb;
          
          // 흰색/검은색 필터링
          if (settings.ignoreWhite && r > 240 && g > 240 && b > 240) return;
          if (settings.ignoreBlack && r < 15 && g < 15 && b < 15) return;
          
          colors.push({
            name: name === 'Vibrant' ? '생동감' :
                  name === 'Muted' ? '차분함' :
                  name === 'DarkVibrant' ? '진한 생동감' :
                  name === 'DarkMuted' ? '진한 차분함' :
                  name === 'LightVibrant' ? '밝은 생동감' :
                  name === 'LightMuted' ? '밝은 차분함' : name,
            color: swatch.hex,
            population: swatch.population,
            hsl: rgbToHsl(r, g, b)
          });
        }
      });

      // 인구수(픽셀 수)로 정렬
      colors.sort((a, b) => b.population - a.population);
      
      setExtractedColors(colors.slice(0, settings.maxColors));
      
    } catch (error) {
      console.error('색상 추출 오류:', error);
      setExtractionError('색상 추출 중 오류가 발생했습니다. 다른 이미지를 시도해보세요.');
    } finally {
      setIsExtracting(false);
    }
  };

  // 색상 복사
  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    // TODO: Toast 알림 추가
  };

  // 팔레트 저장
  const savePalette = () => {
    if (extractedColors.length === 0) return;

    const colorSwatches: ColorSwatch[] = extractedColors.map((color, index) => ({
      id: `extracted-${index}-${Date.now()}`,
      hex: color.color,
      rgb: {
        r: parseInt(color.color.slice(1, 3), 16),
        g: parseInt(color.color.slice(3, 5), 16),
        b: parseInt(color.color.slice(5, 7), 16)
      },
      hsl: color.hsl
    }));

    const palette = {
      id: `image-palette-${Date.now()}`,
      name: `이미지 추출 - ${selectedImage?.name || 'Unknown'}`,
      colors: colorSwatches,
      harmonyType: 'custom' as const,
      baseColor: extractedColors[0].hsl,
      confidence: 0.9,
      keyword: '이미지 추출',
      createdAt: new Date(),
      accessibilityScore: 75,
      source: 'image-extraction',
      tags: ['이미지추출', '자동생성'],
      favorite: false,
      usageCount: 0,
      lastUsed: new Date()
    };

    // 로컬 스토리지에 저장
    try {
      const existing = localStorage.getItem('saved-color-palettes');
      const palettes = existing ? JSON.parse(existing) : [];
      palettes.push(palette);
      localStorage.setItem('saved-color-palettes', JSON.stringify(palettes));
      
      // TODO: Toast 알림 추가
      console.log('팔레트가 저장되었습니다!');
    } catch (error) {
      console.error('팔레트 저장 실패:', error);
    }
  };

  // CSS 내보내기
  const exportToCSS = () => {
    if (extractedColors.length === 0) return;

    const cssContent = `:root {\n${extractedColors.map((color, index) => 
      `  --extracted-color-${index + 1}: ${color.color}; /* ${color.name} */`
    ).join('\n')}\n}`;

    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-colors-${Date.now()}.css`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 이미지 초기화
  const resetImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setExtractedColors([]);
    setExtractionError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const ColorCard: React.FC<{ color: ExtractedColor; index: number }> = ({ color, index }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div 
          className="h-20 cursor-pointer hover:scale-105 transition-transform"
          style={{ backgroundColor: color.color }}
          onClick={() => copyColor(color.color)}
          title={`${color.color} 클릭하여 복사`}
        />
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{color.name}</h4>
              <Badge variant="secondary" className="text-xs">
                {Math.round((color.population / (extractedColors.reduce((sum, c) => sum + c.population, 0)) * 100))}%
              </Badge>
            </div>
            
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>HEX: {color.color}</div>
              <div>HSL: {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%</div>
              <div>픽셀: {color.population.toLocaleString()}</div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => copyColor(color.color)}
            >
              <Copy className="h-3 w-3 mr-1" />
              복사
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">이미지 색상 추출</h1>
        <p className="text-muted-foreground">
          이미지를 업로드하여 주요 색상을 추출하고 팔레트를 생성하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽 패널: 이미지 업로드 및 설정 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 이미지 업로드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                이미지 업로드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                  ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileSelector}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                  className="hidden"
                />
                
                {imagePreview ? (
                  <div className="space-y-3">
                    <img
                      src={imagePreview}
                      alt="업로드된 이미지"
                      className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                    />
                    <p className="text-sm text-muted-foreground">
                      {selectedImage?.name}
                    </p>
                    <Button variant="outline" size="sm" onClick={resetImage}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      제거
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">이미지를 드래그하거나 클릭하여 업로드</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, GIF, WebP 지원 (최대 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {extractionError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{extractionError}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 추출 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                추출 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  품질: {settings.quality}
                </label>
                <Slider
                  value={[settings.quality]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, quality: value }))}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  낮을수록 빠르고, 높을수록 정확함
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  최대 색상 수: {settings.maxColors}
                </label>
                <Slider
                  value={[settings.maxColors]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, maxColors: value }))}
                  max={16}
                  min={3}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  최소 픽셀 수: {settings.minPopulation}
                </label>
                <Slider
                  value={[settings.minPopulation]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, minPopulation: value }))}
                  max={500}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.ignoreWhite}
                    onChange={(e) => setSettings(prev => ({ ...prev, ignoreWhite: e.target.checked }))}
                    className="rounded"
                  />
                  흰색 제외
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.ignoreBlack}
                    onChange={(e) => setSettings(prev => ({ ...prev, ignoreBlack: e.target.checked }))}
                    className="rounded"
                  />
                  검은색 제외
                </label>
              </div>

              <Button
                onClick={extractColors}
                disabled={!selectedImage || isExtracting}
                className="w-full"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    추출 중...
                  </>
                ) : (
                  <>
                    <Palette className="h-4 w-4 mr-2" />
                    색상 추출
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽 패널: 추출된 색상 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  추출된 색상 ({extractedColors.length}개)
                </CardTitle>
                
                {extractedColors.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={savePalette}>
                      <Save className="h-4 w-4 mr-1" />
                      저장
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportToCSS}>
                      <Download className="h-4 w-4 mr-1" />
                      CSS
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {extractedColors.length === 0 ? (
                <div className="text-center py-12">
                  <Palette className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">아직 추출된 색상이 없습니다</h3>
                  <p className="text-muted-foreground">
                    이미지를 업로드하고 "색상 추출" 버튼을 클릭하세요.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {extractedColors.map((color, index) => (
                      <ColorCard key={`${color.color}-${index}`} color={color} index={index} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 숨겨진 캔버스 (이미지 처리용) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageExtractPage;