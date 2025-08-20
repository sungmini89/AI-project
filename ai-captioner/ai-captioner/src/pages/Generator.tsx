import { useState, useEffect } from "react";
import DropzoneUploader from "@/components/DropzoneUploader";
import CaptionOptions from "@/components/CaptionOptions";
import { generateCaption, CaptionType, GenerateResult } from "@/services/aiService";

/**
 * AI 캡션 생성기 메인 페이지
 *
 * @description
 * - 이미지 업로드 및 캡션 생성
 * - 다양한 캡션 타입 지원 (SEO, SNS, 접근성)
 * - 생성된 캡션을 히스토리에 자동 저장
 * - 현재 AI 모드 표시
 */
export default function Generator() {
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [status, setStatus] = useState<GenerateResult["status"]>("idle");
  const [type, setType] = useState<CaptionType>("seo");
  const [error, setError] = useState<string>("");
  const [currentMode, setCurrentMode] = useState<string>("");

  // 현재 AI모드 확인
  useEffect(() => {
    const mode = import.meta.env.VITE_API_MODE || "Mock";
    const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";
    const displayMode = useMock ? "Mock" : mode;
    setCurrentMode(displayMode);
  }, []);

  /**
   * 파일 선택 처리 함수
   *
   * @param {string} dataUrl - 선택된 파일의 Data URL
   * @param {File} selectedFile - 선택된 파일
   */
  const onSelect = (dataUrl: string, selectedFile: File) => {
    setFile(selectedFile);
    setDataUrl(dataUrl);
    setCaption("");
    setStatus("idle");
    setError("");
  };

  /**
   * 캡션 생성 함수
   *
   * @description
   * - AI 서비스를 사용하여 이미지 캡션 생성
   * - 생성된 캡션을 상태에 저장
   * - 에러 처리 및 상태 관리
   */
  const onGenerate = async () => {
    if (!dataUrl) return;

    setStatus("loading");
    setError("");

    try {
      const result = await generateCaption(dataUrl, type);
      setStatus(result.status);

      if (result.status === "success" || result.status === "fallback") {
        setCaption(result.caption || "");
        // 히스토리에 자동 저장
        if (result.caption) {
          saveToHistory(dataUrl, result.caption, result.usedMode);
        }
      } else {
        setError(result.error || "알 수 없는 오류가 발생했습니다.");
      }
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "캡션 생성 중 오류가 발생했습니다.");
    }
  };

  /**
   * 캡션을 클립보드에 복사하는 함수
   */
  const onCopy = () => {
    if (caption) {
      navigator.clipboard.writeText(caption);
      // 복사 완료 알림 (선택사항)
      alert("캡션이 클립보드에 복사되었습니다!");
    }
  };

  /**
   * 캡션을 히스토리에 저장하는 함수
   *
   * @param {string} imageUrl - 이미지 URL
   * @param {string} caption - 저장할 캡션
   * @param {string} mode - 사용된 AI 모드
   */
  const saveToHistory = (imageUrl: string, caption: string, mode: string) => {
    try {
      // 히스토리 아이템 생성
      const historyItem = {
        id: Date.now().toString(),
        imageUrl,
        caption,
        timestamp: new Date().toISOString(),
        mode,
      };

      // 기존 히스토리 로드
      const existingHistory = localStorage.getItem("captionHistory");
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.unshift(historyItem);

      // 최대 100개까지만 저장
      if (history.length > 100) {
        history.splice(100);
      }

      localStorage.setItem("captionHistory", JSON.stringify(history));
    } catch (error) {
      console.error("히스토리 저장 실패:", error);
    }
  };

  /**
   * 수동으로 히스토리에 저장하는 함수
   */
  const onSave = () => {
    if (caption && dataUrl) {
      saveToHistory(dataUrl, caption, currentMode);
      alert("히스토리에 저장되었습니다!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 현재 AI 모드 표시 */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            <span className="mr-2">🤖</span>
            현재 AI 모드: <span className="font-bold ml-1">{currentMode}</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          AI 이미지 캡션 생성기
        </h1>

        {/* 메인 콘텐츠 영역 */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 왼쪽 컬럼 - 입력 및 설정 */}
          <div className="space-y-6">
            {/* 이미지 업로드 섹션 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                이미지 업로드
              </h3>
              <DropzoneUploader onSelect={onSelect} />
            </div>

            {/* 캡션 설정 섹션 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                캡션 설정
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    캡션 타입
                  </label>
                  <CaptionOptions value={type} onChange={setType} />
                </div>
                <button
                  onClick={onGenerate}
                  disabled={!dataUrl || status === "loading"}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {status === "loading" ? "생성 중…" : "캡션 생성"}
                </button>
              </div>
            </div>

            {/* 상태 메시지 표시 */}
            {status === "rate_limited" && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-400">
                  요청이 너무 많습니다. 잠시 후 다시 시도하세요.
                </p>
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-400">오류: {error}</p>
              </div>
            )}
            {status === "fallback" && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-amber-700 dark:text-amber-400">
                  Free API 실패/한도 초과로 오프라인(Ollama) 모드로 전환되었습니다.
                </p>
              </div>
            )}
          </div>

          {/* 오른쪽 컬럼 - 결과 및 이미지 */}
          <div className="space-y-6">
            {/* 생성 결과 섹션 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                생성 결과
              </h3>
              <div className="space-y-4">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="여기에 캡션이 표시됩니다"
                  className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={onCopy}
                    disabled={!caption}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    복사하기
                  </button>
                  <button
                    onClick={onSave}
                    disabled={!caption || !dataUrl}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    히스토리에 저장
                  </button>
                </div>
              </div>
            </div>

            {/* 업로드된 이미지 표시 */}
            {dataUrl && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  업로드된 이미지
                </h3>
                <img src={dataUrl} alt="Uploaded" className="w-full h-48 object-cover rounded-lg" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
