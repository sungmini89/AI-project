import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, File, AlertCircle } from "lucide-react";
import { textProcessor } from "@/services/textProcessor";
import { storageService } from "@/services/storageService";
import { FlashcardService } from "@/services/flashcardService";
import { quizService } from "@/services/quizService";
import { TextDocument } from "@/types";

/**
 * 파일 업로드 컴포넌트의 props 인터페이스
 */
interface FileUploadProps {
  onDocumentProcessed: (document: TextDocument, _analysis: any) => void;
  onError: (_error: string) => void;
}

/**
 * 파일 업로드 및 처리 컴포넌트
 * PDF와 텍스트 파일을 업로드하고 자동으로 플래시카드와 퀴즈를 생성합니다.
 * 드래그 앤 드롭과 파일 선택을 모두 지원합니다.
 * @param {FileUploadProps} props - 컴포넌트 props
 * @returns {JSX.Element} 파일 업로드 컴포넌트
 */
export function FileUpload({ onDocumentProcessed, onError }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const flashcardService = new FlashcardService();

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      console.log("파일 업로드 시작:", files);

      if (!files || files.length === 0) {
        console.log("선택된 파일이 없음");
        return;
      }

      const file = files[0];
      console.log("처리할 파일:", {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
      });

      try {
        setIsProcessing(true);
        setProgress(10);
        setProcessingStep("파일 검증 중...");

        // 파일 타입 및 크기 검증을 pdfProcessor로 위임
        // 더 견고한 검증 로직 사용
        console.log("파일 검증 시작...");

        // 기존 문서와의 중복 확인
        const existingDocuments = await storageService.getAllDocuments();
        const duplicateDoc = existingDocuments.find(
          (doc) =>
            doc.title === file.name.replace(/\.[^/.]+$/, "") ||
            doc.title === file.name
        );

        if (duplicateDoc) {
          const confirmReplace = confirm(
            `"${duplicateDoc.title}" 문서가 이미 존재합니다.\n\n` +
              `기존 플래시카드와 퀴즈를 모두 교체하시겠습니까?\n\n` +
              `⚠️ 이 작업은 되돌릴 수 없습니다.`
          );

          if (!confirmReplace) {
            setIsProcessing(false);
            setProgress(0);
            setProcessingStep("");
            return;
          }

          console.log("사용자가 기존 문서 교체를 선택함");
          
          // 기존 문서와 관련된 플래시카드, 퀴즈 등 모두 삭제
          try {
            await storageService.deleteDocument(duplicateDoc.id);
            await storageService.deleteFlashcardsByDocument(duplicateDoc.id);
            console.log("기존 문서와 관련 데이터 삭제 완료");
          } catch (deleteError) {
            console.warn("기존 데이터 삭제 중 오류:", deleteError);
            // 삭제 실패해도 계속 진행
          }
        }

        setProgress(25);
        setProcessingStep("기존 학습 데이터 초기화 중...");
        
        // 항상 기존 플래시카드와 학습 진도를 모두 삭제 (새로운 문서를 위해)
        try {
          await storageService.clearStudyData();
          console.log("기존 학습 데이터(플래시카드, 학습 세션, 진도) 모두 삭제 완료");
        } catch (clearError) {
          console.warn("기존 학습 데이터 삭제 중 오류:", clearError);
          // 삭제 실패해도 계속 진행
        }

        setProgress(30);
        setProcessingStep("텍스트 추출 중...");
        console.log("문서 처리 시작...");

        // 문서 처리 및 분석
        const result = await textProcessor.processDocumentWithAnalysis(file);
        console.log("문서 처리 완료:", result);

        setProgress(70);
        setProcessingStep("분석 완료, 저장 중...");

        // IndexedDB에 저장 (localStorage 대신 사용하여 용량 제한 해결)
        await storageService.saveDocument(result.document);
        console.log("IndexedDB에 저장 완료");

        setProgress(80);
        setProcessingStep("플래시카드 생성 중...");

        // 플래시카드 자동 생성
        try {
          const flashcardOptions = {
            count: 10, // 기본 10개 생성
            difficulty: "mixed" as const,
            cardTypes: ["definition", "concept"] as (
              | "application"
              | "definition"
              | "concept"
              | "example"
            )[],
            useAI: false, // 오프라인 패턴 기반 생성
          };

          console.log("플래시카드 생성 시작...");
          const flashcards =
            await flashcardService.generateFlashcardsFromDocument(
              result.document,
              flashcardOptions
            );
          console.log("생성된 플래시카드:", flashcards.length, "개");

          // 새로운 플래시카드에 documentId 추가
          const flashcardsWithDocumentId = flashcards.map(card => ({
            ...card,
            documentId: result.document.id
          }));

          // 플래시카드 저장
          if (flashcardsWithDocumentId.length > 0) {
            await storageService.saveFlashcards(flashcardsWithDocumentId);
            console.log("플래시카드 저장 완료");
          }
        } catch (flashcardError) {
          console.warn("플래시카드 생성 실패:", flashcardError);
          // 플래시카드 생성 실패해도 전체 프로세스는 계속
        }

        setProgress(90);
        setProcessingStep("퀴즈 생성 중...");

        // 퀴즈 자동 생성
        try {
          const quizOptions = {
            count: 8, // 기본 8개 문제 생성
            difficulty: "mixed" as const,
            questionTypes: ["multiple-choice", "true-false"] as (
              | "multiple-choice"
              | "true-false"
              | "fill-blank"
            )[],
          };

          console.log("퀴즈 생성 시작...");
          const quizSession = await quizService.createQuizSession(
            result.document.id,
            quizOptions
          );
          console.log(
            "퀴즈 생성 완료:",
            quizSession.questions.length,
            "개 문제"
          );
        } catch (quizError) {
          console.warn("퀴즈 생성 실패:", quizError);
          // 퀴즈 생성 실패해도 전체 프로세스는 계속
        }

        setProgress(100);
        setProcessingStep("완료!");

        // 결과 전달
        onDocumentProcessed(result.document, result.analysis);

        // 상태 초기화
        setTimeout(() => {
          setIsProcessing(false);
          setProgress(0);
          setProcessingStep("");
        }, 1000);
      } catch (error) {
        console.error("파일 처리 오류:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "파일 처리 중 오류가 발생했습니다.";
        console.error("에러 메시지:", errorMessage);
        onError(errorMessage);
        // setErrorMessage(errorMessage); // This line was not in the new_code, so it's removed.

        setIsProcessing(false);
        setProgress(0);
        setProcessingStep("");
      }
    },
    [onDocumentProcessed, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          문서 업로드
        </CardTitle>
        <CardDescription>
          PDF 또는 텍스트 파일을 업로드하여 자동으로 플래시카드를 생성하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isProcessing ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600 mb-2">{processingStep}</p>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-gray-500 mt-2">{progress}% 완료</p>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <File className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {dragActive
                ? "파일을 여기에 놓으세요"
                : "파일을 드래그하거나 선택하세요"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              PDF, TXT 파일 (최대 10MB)
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.txt"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />
            <Button
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={isProcessing}
              variant="outline"
            >
              파일 선택
            </Button>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">지원 기능:</p>
              <ul className="text-blue-700 space-y-1">
                <li>• PDF 텍스트 자동 추출</li>
                <li>• 한국어 텍스트 최적화 처리</li>
                <li>• 키워드 및 요약 자동 생성</li>
                <li>• 난이도 분석 및 읽기 시간 예측</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
