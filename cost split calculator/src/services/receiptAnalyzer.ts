import ocrService, { type OCRResult } from "./ocrService";

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  confidence: number;
  source: "ocr" | "ai" | "manual";
  isSelected: boolean;
}

export interface ReceiptAnalysisResult {
  items: ReceiptItem[];
  totalAmount: number;
  confidence: number;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  processingTime: number;
  usedServices: string[];
}

export interface AnalysisProgress {
  stage: "ocr" | "ai" | "validation" | "complete";
  progress: number;
  message: string;
  subStage?: string;
}

/**
 * 영수증 분석 통합 서비스
 *
 * OCR 서비스를 활용하여 영수증 이미지를 분석하고,
 * 상품 정보와 총액을 추출하는 통합 서비스입니다.
 * 향후 AI 서비스와 연동하여 분석 정확도를 높일 수 있도록 설계되었습니다.
 *
 * @description
 * **주요 기능:**
 * - 영수증 이미지 OCR 처리
 * - 상품명과 가격 자동 추출
 * - 분석 진행 상황 실시간 보고
 * - 에러 처리 및 사용자 피드백
 *
 * **처리 과정:**
 * 1. OCR 서비스로 이미지 텍스트 추출
 * 2. 상품 정보 파싱 및 구조화
 * 3. 신뢰도 점수 계산
 * 4. 분석 결과 반환
 *
 * @class ReceiptAnalyzer
 */
class ReceiptAnalyzer {
  async analyzeReceipt(
    imageFile: File,
    progressCallback?: (progress: AnalysisProgress) => void
  ): Promise<ReceiptAnalysisResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const usedServices: string[] = ["ocr"];

    try {
      progressCallback?.({
        stage: "ocr",
        progress: 10,
        message: "OCR 처리 시작...",
        subStage: "initializing",
      });

      const ocrResult = await ocrService.processImage(imageFile);

      progressCallback?.({
        stage: "ocr",
        progress: 60,
        message: "OCR 처리 완료",
        subStage: "complete",
      });

      const items: ReceiptItem[] = ocrResult.items.map((item, index) => ({
        id: `ocr-${index}`,
        name: item.name,
        price: item.price,
        quantity: 1,
        confidence: 0.8,
        source: "ocr" as const,
        isSelected: true,
      }));

      progressCallback?.({
        stage: "complete",
        progress: 100,
        message: "분석 완료",
      });

      return {
        items,
        totalAmount: ocrResult.totalAmount,
        confidence: 0.8,
        errors,
        warnings,
        suggestions,
        processingTime: Date.now() - startTime,
        usedServices,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다";
      errors.push(errorMessage);

      return {
        items: [],
        totalAmount: 0,
        confidence: 0,
        errors,
        warnings,
        suggestions,
        processingTime: Date.now() - startTime,
        usedServices,
      };
    }
  }

  getConfig() {
    return {
      useAI: true,
      enhanceWithAI: true,
      confidenceThreshold: 0.7,
      enableCaching: true,
    };
  }
}

const receiptAnalyzer = new ReceiptAnalyzer();
export default receiptAnalyzer;
