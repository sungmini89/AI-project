import { useState, useCallback } from "react";
import ocrService, { OCRResult } from "../services/ocrService";
import { BillItem } from "../types";

export interface UseOCROptions {
  autoEnhance?: boolean;
  saveResults?: boolean;
  onComplete?: (result: OCRResult) => void;
  onError?: (error: Error) => void;
}

/**
 * OCR 처리를 위한 커스텀 훅
 *
 * 영수증 이미지의 OCR 처리를 관리하는 훅입니다.
 * 처리 상태, 결과, 에러를 관리하며 콜백 함수를 통해
 * 처리 완료나 에러 발생 시 사용자 정의 동작을 실행할 수 있습니다.
 *
 * @description
 * **주요 기능:**
 * - 이미지 파일 OCR 처리
 * - 처리 상태 관리 (로딩, 완료, 에러)
 * - 결과 데이터 저장 및 관리
 * - 콜백 함수를 통한 이벤트 처리
 *
 * **상태 관리:**
 * - `isProcessing`: OCR 처리 진행 중 여부
 * - `result`: OCR 처리 결과 데이터
 * - `error`: 처리 중 발생한 에러
 *
 * @param options - OCR 처리 옵션
 * @param options.autoEnhance - 자동 개선 여부 (미구현)
 * @param options.saveResults - 결과 저장 여부 (미구현)
 * @param options.onComplete - 처리 완료 콜백
 * @param options.onError - 에러 발생 콜백
 * @returns OCR 처리 상태와 함수들
 */
export function useOCR(options: UseOCROptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const processImage = useCallback(
    async (imageFile: File): Promise<OCRResult> => {
      setIsProcessing(true);
      setError(null);

      try {
        const result = await ocrService.processImage(imageFile);
        setResult(result);
        options.onComplete?.(result);
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("OCR processing failed");
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [options]
  );

  return {
    isProcessing,
    result,
    error,
    processImage,
  };
}
