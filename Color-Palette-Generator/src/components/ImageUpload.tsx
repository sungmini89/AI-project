/**
 * @fileoverview 이미지 업로드 및 미리보기 컴포넌트
 *
 * 사용자가 이미지 파일을 업로드하고 미리보기를 확인할 수 있는
 * 드래그 앤 드롭을 지원하는 파일 업로드 컴포넌트입니다.
 *
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 *
 * **주요 기능:**
 * - 드래그 앤 드롭 파일 업로드
 * - 이미지 파일 유효성 검사
 * - 실시간 이미지 미리보기
 * - 파일 크기 및 형식 제한
 * - 로딩 상태 표시
 * - 에러 메시지 표시
 * - 접근성 지원 (ARIA 라벨, 키보드 네비게이션)
 *
 * **지원 형식:**
 * - JPEG, JPG, PNG, WebP, GIF
 * - 최대 파일 크기: 10MB (설정 가능)
 *
 * **사용 예시:**
 * ```tsx
 * <ImageUpload
 *   onImageUpload={handleImageUpload}
 *   maxSize={10}
 *   acceptedFormats={['image/jpeg', 'image/png']}
 * />
 * ```
 */

import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ImageUpload 컴포넌트의 Props 인터페이스
 *
 * @interface ImageUploadProps
 * @property {Function} onImageUpload - 이미지 업로드 시 콜백 함수
 * @property {boolean} [isLoading=false] - 로딩 상태
 * @property {number} [maxSize=10] - 최대 파일 크기 (MB)
 * @property {string[]} [acceptedFormats] - 허용된 파일 형식 배열
 * @property {string} [className] - 추가 CSS 클래스명
 */
interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isLoading?: boolean;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  isLoading = false,
  maxSize = 10,
  acceptedFormats = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
  className,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!acceptedFormats.includes(file.type)) {
        return `지원하지 않는 파일 형식입니다. 지원 형식: ${acceptedFormats
          .map((format) => format.split("/")[1].toUpperCase())
          .join(", ")}`;
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        return `파일 크기가 너무 큽니다. 최대 크기: ${maxSize}MB (현재: ${fileSizeMB.toFixed(
          1
        )}MB)`;
      }

      return null;
    },
    [acceptedFormats, maxSize]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setUploadedFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Trigger upload callback
      onImageUpload(file);
    },
    [validateFile, onImageUpload]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const clearImage = useCallback(() => {
    setUploadedFile(null);
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewImage]);

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            이미지에서 색상 추출
          </CardTitle>
          <CardDescription>
            이미지를 업로드하여 주요 색상들을 추출하고 조화로운 팔레트를
            생성합니다.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!previewImage ? (
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={!isLoading ? handleButtonClick : undefined}
              data-testid="image-upload-area"
              role="button"
              aria-label="이미지 파일을 드래그하거나 클릭하여 업로드"
              tabIndex={isLoading ? -1 : 0}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats.join(",")}
                onChange={handleInputChange}
                className="sr-only"
                disabled={isLoading}
                data-testid="file-input"
                aria-label="이미지 파일 선택"
              />

              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">
                    {isLoading
                      ? "이미지 처리 중..."
                      : "이미지를 드래그하거나 클릭하여 업로드"}
                  </p>
                  <p className="text-sm text-gray-500">
                    지원 형식: JPG, PNG, WebP, GIF (최대 {maxSize}MB)
                  </p>
                </div>

                {!isLoading && (
                  <Button type="button" variant="outline" className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    파일 선택
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={previewImage}
                  alt="업로드된 이미지 미리보기"
                  className="w-full h-64 object-cover rounded-lg"
                  data-testid="uploaded-image-preview"
                />
                {!isLoading && (
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                )}
                {isLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">색상 분석 중...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* File Info */}
              {uploadedFile && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    {!isLoading && (
                      <Button variant="outline" size="sm" onClick={clearImage}>
                        다시 선택
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Usage Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm text-blue-900 mb-2">
              💡 더 나은 결과를 위한 팁
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 색상이 뚜렷하고 다양한 이미지를 사용해보세요</li>
              <li>• 고해상도 이미지일수록 더 정확한 색상 추출이 가능합니다</li>
              <li>
                • 자연 풍경, 예술 작품, 제품 사진 등이 좋은 결과를 만듭니다
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
