import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, X, FileImage, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageExtractorProps {
  onImageExtracted?: (file: File, extractedColors: ExtractedColors) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
  className?: string;
}

interface ExtractedColors {
  vibrant: { r: number; g: number; b: number; population: number } | null;
  muted: { r: number; g: number; b: number; population: number } | null;
  darkVibrant: { r: number; g: number; b: number; population: number } | null;
  darkMuted: { r: number; g: number; b: number; population: number } | null;
  lightVibrant: { r: number; g: number; b: number; population: number } | null;
  lightMuted: { r: number; g: number; b: number; population: number } | null;
}

interface ProgressStage {
  name: string;
  progress: number;
  message: string;
}

const progressStages: ProgressStage[] = [
  { name: 'upload', progress: 20, message: '이미지 업로드 중...' },
  { name: 'processing', progress: 40, message: '이미지 전처리 중...' },
  { name: 'extracting', progress: 70, message: '주요 색상 추출 중...' },
  { name: 'generating', progress: 90, message: '조화 팔레트 생성 중...' },
  { name: 'complete', progress: 100, message: '완료!' }
];

export const ImageExtractor: React.FC<ImageExtractorProps> = ({
  onImageExtracted,
  onError,
  isLoading = false,
  className
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [currentStage, setCurrentStage] = useState<ProgressStage | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 지원되는 파일 형식
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = useCallback((file: File): boolean => {
    if (!supportedFormats.includes(file.type)) {
      onError?.('지원되지 않는 파일 형식입니다. JPG, PNG, WebP 파일을 업로드해주세요.');
      return false;
    }

    if (file.size > maxFileSize) {
      onError?.('파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.');
      return false;
    }

    return true;
  }, [onError]);

  const processImage = useCallback(async (file: File) => {
    try {
      // 진행률 시뮬레이션
      for (let i = 0; i < progressStages.length; i++) {
        const stage = progressStages[i];
        setCurrentStage(stage);
        setExtractionProgress(stage.progress);
        
        if (i < progressStages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Vibrant.js를 사용한 색상 추출 (시뮬레이션)
      // 실제 구현에서는 vibrant.js를 사용합니다
      const mockExtractedColors: ExtractedColors = {
        vibrant: { r: 220, g: 20, b: 60, population: 8543 },
        muted: { r: 169, g: 169, b: 169, population: 6234 },
        darkVibrant: { r: 139, g: 0, b: 0, population: 4532 },
        darkMuted: { r: 105, g: 105, b: 105, population: 3421 },
        lightVibrant: { r: 255, g: 192, b: 203, population: 5643 },
        lightMuted: { r: 211, g: 211, b: 211, population: 4123 }
      };

      onImageExtracted?.(file, mockExtractedColors);
      
      setTimeout(() => {
        setCurrentStage(null);
        setExtractionProgress(0);
      }, 1000);

    } catch (error) {
      console.error('이미지 처리 실패:', error);
      onError?.('이미지 처리 중 오류가 발생했습니다. 다른 이미지를 시도해주세요.');
      setCurrentStage(null);
      setExtractionProgress(0);
    }
  }, [onImageExtracted, onError]);

  const handleFiles = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    if (!validateFile(file)) return;

    await processImage(file);
  }, [validateFile, processImage]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const openFileSelector = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const clearPreview = useCallback(() => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const openCamera = useCallback(() => {
    // 모바일 카메라 촬영 지원
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            이미지 색상 추출
          </CardTitle>
          <CardDescription>
            이미지를 업로드하면 AI가 주요 색상을 추출하여 조화로운 팔레트를 생성합니다
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 파일 업로드 영역 */}
          {!previewImage && (
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
                dragActive 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={supportedFormats.join(',')}
                onChange={handleInputChange}
                disabled={isLoading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                multiple={false}
              />

              <div className="space-y-4">
                <div className="flex justify-center">
                  {isLoading ? (
                    <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
                  ) : (
                    <Upload className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {dragActive ? '파일을 놓아주세요' : '이미지를 드래그하거나 클릭하여 업로드'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG, WebP 형식 지원 (최대 10MB)
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={openFileSelector}
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    파일 선택
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={openCamera}
                    disabled={isLoading}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    카메라 촬영
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 이미지 미리보기 */}
          {previewImage && (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="업로드된 이미지" 
                  className="w-full max-h-64 object-contain rounded-lg shadow-md"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={clearPreview}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* 진행률 표시 */}
          {currentStage && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {currentStage.message}
                </span>
                <span className="text-sm text-gray-500">
                  {currentStage.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${extractionProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* 지원 형식 안내 */}
          <div className="text-xs text-gray-500 border-t pt-4">
            <div className="flex justify-between items-center">
              <span>지원 형식: JPG, PNG, WebP</span>
              <span>최대 크기: 10MB</span>
            </div>
            <p className="mt-2">
              * 완전 오프라인으로 처리되며 이미지는 서버에 전송되지 않습니다
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};