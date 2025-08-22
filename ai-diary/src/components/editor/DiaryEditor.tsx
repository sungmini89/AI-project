import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "react-hot-toast";
import { databaseService } from "../../services/databaseService";
import { emotionAnalysisService } from "../../services/emotionAnalysisService";
import { notificationService } from "../../services/notificationService";
import { useApp } from "../../contexts/AppContext";
import type {
  DiaryEntry,
  EmotionAnalysisResult,
} from "../../services/databaseService";

/**
 * 일기 에디터 컴포넌트
 *
 * Tiptap을 기반으로 한 리치 텍스트 에디터로, 일기 작성과 편집을 지원합니다.
 * 감정 분석 기능이 통합되어 있어 일기 작성 후 자동으로 감정을 분석하고
 * 결과를 저장합니다.
 *
 * 주요 기능:
 * - 리치 텍스트 편집 (굵게, 기울임, 목록 등)
 * - 자동 감정 분석
 * - 일기 저장 및 수정
 * - 다크모드/라이트모드 지원
 * - 한국어/영어 다국어 지원
 *
 * @param entry - 편집할 일기 항목 (수정 모드일 때만 제공)
 * @param onSave - 저장 완료 시 호출되는 콜백 함수
 * @param onCancel - 취소 시 호출되는 콜백 함수
 * @returns 일기 에디터 JSX
 */
interface DiaryEditorProps {
  entry?: DiaryEntry;
  onSave?: (entry: DiaryEntry) => Promise<void>;
  onCancel?: () => void;
}

const DiaryEditor: React.FC<DiaryEditorProps> = ({
  entry,
  onSave,
  onCancel,
}) => {
  const { language, isDark } = useApp();
  const [title, setTitle] = useState(entry?.title || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Tiptap 에디터 인스턴스를 생성합니다.
   * StarterKit을 사용하여 기본적인 텍스트 편집 기능을 제공합니다.
   */
  const editor = useEditor({
    extensions: [StarterKit],
    content: entry?.content || "",
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${
          isDark
            ? "prose-invert prose-gray prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-em:text-gray-300 prose-blockquote:text-gray-400 prose-code:text-gray-300"
            : "prose-gray prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-em:text-gray-700 prose-blockquote:text-gray-600 prose-code:text-gray-700"
        }`,
      },
    },
  });

  /**
   * HTML 태그를 제거하여 순수 텍스트만 추출합니다.
   * 감정 분석 시 HTML 마크업이 분석에 영향을 주지 않도록 합니다.
   *
   * @param html - HTML 태그가 포함된 문자열
   * @returns HTML 태그가 제거된 순수 텍스트
   */
  const stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, "").trim();
  };

  /**
   * 제목과 내용을 검증하고, 감정 분석을 수행한 후 데이터베이스에 저장합니다.
   *
   * @returns Promise<void>
   */
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error(
        language === "ko" ? "제목을 입력해주세요." : "Please enter a title."
      );
      return;
    }

    if (!editor?.getHTML() || editor.getHTML().trim() === "<p></p>") {
      toast.error(
        language === "ko" ? "내용을 입력해주세요." : "Please enter content."
      );
      return;
    }

    setIsSaving(true);
    setIsAnalyzing(true);

    try {
      const content = editor.getHTML();
      const cleanContent = stripHtmlTags(content); // 순수 텍스트로 저장

      // 감정 분석 수행
      const analysisResult = await emotionAnalysisService.analyzeEmotion(
        cleanContent
      );

      const diaryEntry: DiaryEntry = {
        id:
          entry?.id ||
          `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        content: cleanContent, // 순수 텍스트로 저장
        createdAt: entry?.createdAt || new Date(),
        updatedAt: new Date(),
        emotionAnalysis: analysisResult,
      };

      // 실제 저장 수행
      if (entry) {
        // 수정 모드
        await databaseService.updateEntry(diaryEntry);
        toast.success(
          language === "ko"
            ? "일기가 수정되었습니다."
            : "Diary has been updated."
        );
      } else {
        // 새로 작성 모드
        await databaseService.addEntry(diaryEntry);
        toast.success(
          language === "ko" ? "일기가 저장되었습니다." : "Diary has been saved."
        );
      }

      // 저장 성공 시 onSave 콜백 호출
      if (onSave) {
        await onSave(diaryEntry);
      }

      // 감정 분석 완료 알림
      if (analysisResult) {
        await notificationService.notifyEmotionAnalyzed(
          analysisResult.primaryEmotion
        );
      }
    } catch (error) {
      console.error("일기 저장 실패:", error);
      toast.error(
        language === "ko"
          ? "일기 저장에 실패했습니다."
          : "Failed to save diary."
      );
    } finally {
      setIsSaving(false);
      setIsAnalyzing(false);
    }
  };

  /**
   * 에디터 내용을 취소하고 초기 상태로 되돌립니다.
   * 사용자에게 확인을 요청한 후 취소를 진행합니다.
   */
  const handleCancel = () => {
    const hasChanges =
      title !== (entry?.title || "") ||
      editor?.getHTML() !== (entry?.content || "");

    if (hasChanges) {
      const message =
        language === "ko"
          ? "변경사항이 저장되지 않았습니다. 정말 취소하시겠습니까?"
          : "Changes are not saved. Are you sure you want to cancel?";

      if (window.confirm(message)) {
        onCancel?.();
      }
    } else {
      onCancel?.();
    }
  };

  /**
   * 감정 분석 결과를 시각적으로 표시합니다.
   * 주요 감정과 긍정/부정 키워드를 포함한 분석 결과를 보여줍니다.
   *
   * @param analysisResult - 감정 분석 결과
   * @returns 감정 분석 결과 JSX
   */
  const getEmotionDisplay = (analysisResult: EmotionAnalysisResult) => {
    const { primaryEmotion, score, words, confidence } = analysisResult;

    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">
          {language === "ko" ? "감정 분석 결과" : "Emotion Analysis Result"}
        </h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium">
              {language === "ko" ? "주요 감정:" : "Primary Emotion:"}
            </span>
            <span className="text-blue-700">{primaryEmotion}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">
              {language === "ko" ? "감정 점수:" : "Emotion Score:"}
            </span>
            <span
              className={`font-bold ${
                score > 0
                  ? "text-green-600"
                  : score < 0
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {score > 0 ? "+" : ""}
              {score.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">
              {language === "ko" ? "신뢰도:" : "Confidence:"}
            </span>
            <span className="text-blue-700">
              {(confidence * 100).toFixed(1)}%
            </span>
          </div>

          {/* 긍정적 키워드 */}
          {words.positive.length > 0 && (
            <div>
              <span className="font-medium text-green-700">
                {language === "ko" ? "긍정적 키워드:" : "Positive Keywords:"}
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {words.positive.slice(0, 3).map((word, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 부정적 키워드 */}
          {words.negative.length > 0 && (
            <div>
              <span className="font-medium text-red-700">
                {language === "ko" ? "부정적 키워드:" : "Negative Keywords:"}
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {words.negative.slice(0, 3).map((word, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto`}>
      <div
        className={`rounded-xl shadow-sm border ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        {/* 헤더 */}
        <div
          className={`border-b p-6 ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <input
            type="text"
            name="title"
            data-testid="diary-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              language === "ko"
                ? "일기 제목을 입력하세요..."
                : "Enter diary title..."
            }
            className={`w-full text-2xl font-bold placeholder-gray-500 border-none outline-none focus:ring-0 bg-transparent ${
              isDark
                ? "text-white placeholder-gray-400"
                : "text-gray-900 placeholder-gray-500"
            }`}
          />

          <div className="flex items-center justify-between mt-4">
            <div
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {entry?.createdAt &&
                new Date(entry.createdAt).toLocaleDateString(
                  language === "ko" ? "ko" : "en-US",
                  {
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  }
                )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={isSaving || isAnalyzing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                title={language === "ko" ? "저장" : "Save"}
              >
                <span className="text-sm">
                  {isSaving
                    ? language === "ko"
                      ? "저장 중..."
                      : "Saving..."
                    : language === "ko"
                    ? "저장"
                    : "Save"}
                </span>
              </button>

              <button
                onClick={handleCancel}
                disabled={isSaving || isAnalyzing}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed ${
                  isDark
                    ? "text-gray-300 hover:text-white hover:bg-gray-700 disabled:text-gray-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:text-gray-400"
                }`}
                title={language === "ko" ? "취소" : "Cancel"}
              >
                <span className="text-sm">
                  {language === "ko" ? "취소" : "Cancel"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 에디터 */}
        <div className="mt-6">
          <EditorContent editor={editor} />
        </div>

        {/* 감정 분석 결과 표시 */}
        {entry?.emotionAnalysis && (
          <div className="mt-6" data-testid="emotion-result">
            {getEmotionDisplay(entry.emotionAnalysis)}
          </div>
        )}

        {/* 로딩 상태 표시 */}
        {(isSaving || isAnalyzing) && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>
                {isSaving
                  ? language === "ko"
                    ? "저장 중..."
                    : "Saving..."
                  : language === "ko"
                  ? "감정 분석 중..."
                  : "Analyzing emotion..."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryEditor;
