import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Save,
  Eye,
  EyeOff,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  emotionAnalysisService,
  type EmotionAnalysisResult,
  type EmotionType,
  EMOTION_EMOJIS,
  EMOTION_COLORS,
} from "../../services/emotionAnalysisService";
import type { DiaryEntry } from "../../services/databaseService";
import { databaseService } from "../../services/databaseService";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface DiaryEditorProps {
  entry?: DiaryEntry;
  onSave?: (entry: DiaryEntry) => void;
  onCancel?: () => void;
  className?: string;
}

const DiaryEditor: React.FC<DiaryEditorProps> = ({
  entry,
  onSave,
  onCancel,
  className = "",
}) => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<EmotionAnalysisResult | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "오늘 하루는 어땠나요? 자유롭게 작성해보세요...",
      }),
    ],
    content: entry?.content || "",
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || "");
      setContent(entry.content || "");
      setAnalysisResult(entry.emotionAnalysis || null);
    }
  }, [entry]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleAnalyzeEmotion = async () => {
    if (!content.trim()) {
      toast.error("분석할 내용을 먼저 작성해주세요.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await emotionAnalysisService.analyzeEmotion(content);
      setAnalysisResult(result);
      toast.success("감정 분석이 완료되었습니다!");
    } catch (error) {
      console.error("감정 분석 실패:", error);
      toast.error("감정 분석에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("일기 내용을 작성해주세요.");
      return;
    }

    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const diaryEntry: DiaryEntry = {
        id: entry?.id || Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        createdAt: entry?.createdAt || new Date(),
        updatedAt: new Date(),
        emotionAnalysis: analysisResult,
      };

      if (entry?.id) {
        await databaseService.updateEntry(diaryEntry);
        toast.success("일기가 수정되었습니다.");
      } else {
        await databaseService.addEntry(diaryEntry);
        toast.success("일기가 저장되었습니다.");
      }

      onSave?.(diaryEntry);
    } catch (error) {
      console.error("일기 저장 실패:", error);
      toast.error("일기 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    if (!content.trim()) {
      toast.error("내보낼 내용이 없습니다.");
      return;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diary-${format(new Date(), "yyyy-MM-dd")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("일기가 텍스트 파일로 내보내졌습니다.");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setContent(text);
        if (editor) {
          editor.commands.setContent(text);
        }
        toast.success("파일이 성공적으로 가져와졌습니다.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm("정말로 모든 내용을 지우시겠습니까?")) {
      setContent("");
      setTitle("");
      setAnalysisResult(null);
      if (editor) {
        editor.commands.clearContent();
      }
      toast.success("내용이 초기화되었습니다.");
    }
  };

  const getEmotionDisplay = () => {
    if (!analysisResult) return null;

    const primaryEmotion = analysisResult.primaryEmotion;
    const confidence = analysisResult.confidence;
    const score = analysisResult.score;

    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
            감정 분석 결과
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 주요 감정 */}
          <div className="text-center">
            <div className="text-4xl mb-2">
              {EMOTION_EMOJIS[primaryEmotion]}
            </div>
            <div className="font-semibold text-gray-900 capitalize">
              {primaryEmotion}
            </div>
            <div className="text-sm text-gray-600">주요 감정</div>
          </div>

          {/* 감정 점수 */}
          <div className="text-center">
            <div
              className="text-2xl font-bold mb-2"
              style={{
                color:
                  score > 0 ? "#10b981" : score < 0 ? "#ef4444" : "#6b7280",
              }}
            >
              {score > 0 ? "+" : ""}
              {score.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">감정 점수</div>
          </div>

          {/* 신뢰도 */}
          <div className="text-center">
            <div className="text-2xl font-bold mb-2 text-blue-600">
              {Math.round(confidence * 100)}%
            </div>
            <div className="text-sm text-gray-600">신뢰도</div>
          </div>
        </div>

        {/* 감정 단어들 */}
        {(analysisResult.words.positive.length > 0 ||
          analysisResult.words.negative.length > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.words.positive.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-green-700 mb-2">
                    긍정적 단어
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {analysisResult.words.positive
                      .slice(0, 5)
                      .map((word, index) => (
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
              {analysisResult.words.negative.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-red-700 mb-2">
                    부정적 단어
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {analysisResult.words.negative
                      .slice(0, 5)
                      .map((word, index) => (
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
        )}
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* 헤더 */}
        <div className="border-b border-gray-200 p-6">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="일기 제목을 입력하세요..."
            className="w-full text-2xl font-bold text-gray-900 placeholder-gray-500 border-none outline-none focus:ring-0 bg-transparent"
          />

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              {entry?.createdAt &&
                format(new Date(entry.createdAt), "yyyy년 MM월 dd일 EEEE", {
                  locale: ko,
                })}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={isPreviewMode ? "편집 모드" : "미리보기 모드"}
              >
                {isPreviewMode ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {isPreviewMode ? "편집" : "미리보기"}
                </span>
              </button>

              <button
                onClick={handleAnalyzeEmotion}
                disabled={isAnalyzing || !content.trim()}
                className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                title="감정 분석"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">
                  {isAnalyzing ? "분석 중..." : "감정 분석"}
                </span>
              </button>

              <div className="flex items-center space-x-1">
                <button
                  onClick={handleExport}
                  disabled={!content.trim()}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                  title="내보내기"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="가져오기"
                >
                  <Upload className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="초기화"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 감정 분석 결과 */}
        {analysisResult && (
          <div className="p-6 border-b border-gray-200">
            {getEmotionDisplay()}
          </div>
        )}

        {/* 에디터 콘텐츠 */}
        <div className="p-6">
          {isPreviewMode ? (
            <div className="prose max-w-none">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {title || "제목 없음"}
              </h1>
              <div
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          ) : (
            <div className="min-h-96">
              <EditorContent
                editor={editor}
                className="prose max-w-none [&_.ProseMirror]:min-h-96 [&_.ProseMirror]:outline-none [&_.ProseMirror]:p-4 [&_.ProseMirror]:border [&_.ProseMirror]:border-gray-300 [&_.ProseMirror]:rounded-lg [&_.ProseMirror:focus]:border-blue-500 [&_.ProseMirror:focus]:ring-2 [&_.ProseMirror:focus]:ring-blue-200 [&_.ProseMirror]:transition-colors"
              />
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {content.replace(/<[^>]*>/g, "").length}자
            </div>

            <div className="flex items-center space-x-3">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isSaving}
                >
                  취소
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving || !content.trim() || !title.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "저장 중..." : "저장"}</span>
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default DiaryEditor;
