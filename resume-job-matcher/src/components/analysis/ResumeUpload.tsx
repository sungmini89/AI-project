/**
 * @fileoverview 이력서 업로드 컴포넌트
 * @description 사용자가 PDF 이력서를 업로드하고 텍스트를 추출할 수 있는 컴포넌트입니다.
 * 드래그 앤 드롭, 파일 선택, 진행률 표시 등의 기능을 제공하며,
 * useFileUpload 훅을 사용하여 파일 처리 상태를 관리합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import React, { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Upload, File, X, RefreshCw, AlertCircle } from "lucide-react";

/**
 * 이력서 업로드 컴포넌트의 속성 인터페이스
 * @description 컴포넌트가 받을 수 있는 props를 정의합니다.
 */
interface ResumeUploadProps {
  /** 텍스트 추출 완료 시 호출되는 콜백 함수 */
  onTextExtracted?: (text: string) => void;
}

/**
 * 이력서 업로드 컴포넌트
 * @description PDF 이력서 파일을 업로드하고 텍스트를 추출하는 기능을 제공합니다.
 * 드래그 앤 드롭, 파일 선택, 진행률 표시, 오류 처리 등의 기능을 포함합니다.
 *
 * @param {ResumeUploadProps} props - 컴포넌트 속성
 * @returns {JSX.Element} 이력서 업로드 컴포넌트
 *
 * @example
 * ```tsx
 * <ResumeUpload onTextExtracted={(text) => console.log(text)} />
 * ```
 */
export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onTextExtracted,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const {
    file,
    text,
    uploading,
    processing,
    error,
    uploadFile,
    clearFile,
    retryUpload,
    isProcessing,
  } = useFileUpload();

  /**
   * 파일 선택 처리 함수
   * @description 선택된 파일을 업로드하고 텍스트 추출이 완료되면 콜백을 호출합니다.
   *
   * @param {File} selectedFile - 선택된 파일 객체
   */
  const handleFileSelect = (selectedFile: File) => {
    uploadFile(selectedFile)
      .then((result) => {
        if (result.text && onTextExtracted) {
          onTextExtracted(result.text);
        }
      })
      .catch((err) => {
        console.error("Upload failed:", err);
      });
  };

  /**
   * 파일 입력 필드 클릭 처리 함수
   * @description 숨겨진 파일 입력 필드를 클릭하여 파일 선택 다이얼로그를 엽니다.
   */
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * 파일 변경 처리 함수
   * @description 파일 입력 필드에서 파일이 선택되었을 때 호출됩니다.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - 파일 변경 이벤트
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  /**
   * 드래그 오버 처리 함수
   * @description 파일이 드롭존 위에 드래그되었을 때 호출됩니다.
   *
   * @param {React.DragEvent} e - 드래그 이벤트
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  /**
   * 드래그 리브 처리 함수
   * @description 파일이 드롭존을 벗어났을 때 호출됩니다.
   *
   * @param {React.DragEvent} e - 드래그 이벤트
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  /**
   * 파일 드롭 처리 함수
   * @description 파일이 드롭존에 드롭되었을 때 호출됩니다.
   * PDF 파일만 처리하며, 첫 번째 PDF 파일을 선택합니다.
   *
   * @param {React.DragEvent} e - 드래그 이벤트
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file) => file.type === "application/pdf");

    if (pdfFile) {
      handleFileSelect(pdfFile);
    }
  };

  /**
   * 진행률 값을 계산하는 함수
   * @description 현재 상태에 따라 진행률을 반환합니다.
   *
   * @returns {number} 진행률 값 (0-100)
   */
  const getProgressValue = () => {
    if (uploading) return 30;
    if (processing) return 70;
    if (text) return 100;
    return 0;
  };

  const renderUploadArea = () => {
    if (file && !error) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
            <File className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {!isProcessing && (
              <Button variant="ghost" size="icon" onClick={clearFile}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {uploading
                    ? "파일 업로드 중..."
                    : processing
                    ? "PDF 텍스트 추출 중..."
                    : "완료"}
                </span>
                <span>{getProgressValue()}%</span>
              </div>
              <Progress value={getProgressValue()} />
            </div>
          )}

          {text && (
            <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✅ 텍스트 추출 완료 ({text.length.toLocaleString()}자)
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center space-y-4 transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload
          className={`mx-auto h-12 w-12 ${
            dragOver ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {dragOver
              ? "PDF 파일을 여기에 놓으세요"
              : "PDF 파일을 업로드하세요"}
          </p>
          <p className="text-sm text-muted-foreground">
            드래그 앤 드롭하거나 클릭하여 파일을 선택하세요
          </p>
          <p className="text-xs text-muted-foreground">
            최대 10MB, PDF 형식만 지원
          </p>
        </div>
        <Button onClick={handleClick} disabled={isProcessing}>
          <Upload className="h-4 w-4 mr-2" />
          파일 선택
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          이력서 업로드
        </CardTitle>
        <CardDescription>
          PDF 이력서를 업로드하여 텍스트를 분석합니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderUploadArea()}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  업로드 오류
                </p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  {error}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryUpload}
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  다시 시도
                </Button>
              </div>
            </div>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};
