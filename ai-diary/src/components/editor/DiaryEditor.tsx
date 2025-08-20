import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Save,
  Eye,
  EyeOff,
  Smile,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { emotionAnalysisService, EmotionAnalysisResult, EmotionType, EMOTION_EMOJIS, EMOTION_COLORS } from '../../services/emotionAnalysisService';
import { DiaryEntry } from '../../services/databaseService';

interface DiaryEditorProps {
  initialContent?: string;
  initialTitle?: string;
  onSave?: (entry: Partial<DiaryEntry>) => void;
  onContentChange?: (content: string, htmlContent: string) => void;
  onTitleChange?: (title: string) => void;
  autoSave?: boolean;
  autoSaveInterval?: number;
  isPreviewMode?: boolean;
  className?: string;
}

interface EmotionIndicatorProps {
  emotion: EmotionType;
  score: number;
  isActive: boolean;
}

const EmotionIndicator: React.FC<EmotionIndicatorProps> = ({ emotion, score, isActive }) => {
  const percentage = Math.round(score * 100);
  const emoji = EMOTION_EMOJIS[emotion];
  const color = EMOTION_COLORS[emotion];

  return (
    <div className={`flex items-center space-x-2 p-2 rounded-lg transition-all ${
      isActive ? 'bg-gray-100 scale-105' : 'bg-gray-50'
    }`}>
      <span className="text-xl">{emoji}</span>
      <div className="flex-1">
        <div className="text-xs font-medium text-gray-700 capitalize">{emotion}</div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: color 
            }}
          />
        </div>
        <div className="text-xs text-gray-500">{percentage}%</div>
      </div>
    </div>
  );
};

const DiaryEditor: React.FC<DiaryEditorProps> = ({
  initialContent = '',
  initialTitle = '',
  onSave,
  onContentChange,
  onTitleChange,
  autoSave = true,
  autoSaveInterval = 30000,
  isPreviewMode = false,
  className = ''
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [emotionAnalysis, setEmotionAnalysis] = useState<EmotionAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showEmotionPanel, setShowEmotionPanel] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Tiptap 에디터 초기화
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: '오늘 하루는 어땠나요? 자유롭게 써보세요...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getText();
      const htmlContent = editor.getHTML();
      
      // 단어 수 계산
      const words = content.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      
      onContentChange?.(content, htmlContent);
      
      // 실시간 감정 분석 (디바운스)
      if (content.length > 10) {
        debouncedAnalyze(content);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-gray max-w-none focus:outline-none',
      },
    },
  });

  // 감정 분석 디바운스
  const debouncedAnalyze = useMemo(
    () => {
      let timeoutId: NodeJS.Timeout;
      return (text: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          analyzeEmotion(text);
        }, 1000);
      };
    },
    []
  );

  // 감정 분석 실행
  const analyzeEmotion = useCallback(async (text: string) => {
    if (!text.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const result = await emotionAnalysisService.analyzeEmotion(text);
      setEmotionAnalysis(result);
      setShowEmotionPanel(true);
    } catch (error) {
      console.error('감정 분석 실패:', error);
      toast.error('감정 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  // 제목 변경 핸들러
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    onTitleChange?.(newTitle);
  }, [onTitleChange]);

  // 태그 추가
  const handleAddTag = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags(prev => [...prev, newTag]);
      }
      setTagInput('');
    }
  }, [tagInput, tags]);

  // 태그 삭제
  const removeTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  // 저장 핸들러
  const handleSave = useCallback(() => {
    if (!editor) return;
    
    const content = editor.getText();
    const htmlContent = editor.getHTML();
    
    if (!content.trim() && !title.trim()) {
      toast.error('제목 또는 내용을 입력해주세요.');
      return;
    }

    const entry: Partial<DiaryEntry> = {
      title: title || '제목 없음',
      content,
      htmlContent,
      date: new Date(),
      tags,
      mood: emotionAnalysis?.primaryEmotion || 'neutral',
      wordCount,
      isPrivate,
      emotionAnalysis: emotionAnalysis || undefined,
    };

    onSave?.(entry);
    setLastSaved(new Date());
    toast.success('저장되었습니다.');
  }, [editor, title, tags, wordCount, isPrivate, emotionAnalysis, onSave]);

  // 자동 저장
  useEffect(() => {
    if (!autoSave) return;

    const intervalId = setInterval(() => {
      if (editor?.getText().trim() && title.trim()) {
        handleSave();
      }
    }, autoSaveInterval);

    return () => clearInterval(intervalId);
  }, [autoSave, autoSaveInterval, editor, title, handleSave]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'b':
            e.preventDefault();
            editor?.chain().focus().toggleBold().run();
            break;
          case 'i':
            e.preventDefault();
            editor?.chain().focus().toggleItalic().run();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, handleSave]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className={`diary-editor ${className}`}>
      {/* 헤더 */}
      <div className="editor-header bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="제목을 입력하세요..."
            className="text-2xl font-bold bg-transparent border-none outline-none placeholder-gray-400 flex-1"
          />
          
          <div className="flex items-center space-x-2">
            {/* 감정 분석 토글 */}
            <button
              onClick={() => setShowEmotionPanel(!showEmotionPanel)}
              className={`btn btn-ghost p-2 ${showEmotionPanel ? 'bg-blue-100 text-blue-600' : ''}`}
              title="감정 분석 패널"
            >
              <BarChart3 size={18} />
            </button>
            
            {/* 프라이빗 모드 토글 */}
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              className={`btn btn-ghost p-2 ${isPrivate ? 'bg-red-100 text-red-600' : ''}`}
              title={isPrivate ? '비공개 일기' : '공개 일기'}
            >
              {isPrivate ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            
            {/* 저장 버튼 */}
            <button
              onClick={handleSave}
              className="btn btn-primary"
              title="저장 (Ctrl+S)"
            >
              <Save size={18} />
              <span className="hidden sm:inline ml-1">저장</span>
            </button>
          </div>
        </div>

        {/* 태그 입력 */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="태그 입력 후 Enter"
            className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* 툴바 */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`btn btn-ghost p-2 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            title="굵게 (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`btn btn-ghost p-2 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            title="기울임 (Ctrl+I)"
          >
            <Italic size={16} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`btn btn-ghost p-2 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
            title="글머리 기호 목록"
          >
            <List size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`btn btn-ghost p-2 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
            title="번호 목록"
          >
            <ListOrdered size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`btn btn-ghost p-2 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
            title="인용구"
          >
            <Quote size={16} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="btn btn-ghost p-2 disabled:opacity-50"
            title="실행 취소"
          >
            <Undo size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="btn btn-ghost p-2 disabled:opacity-50"
            title="다시 실행"
          >
            <Redo size={16} />
          </button>
        </div>
      </div>

      <div className="editor-content flex">
        {/* 메인 에디터 영역 */}
        <div className="flex-1 p-4">
          {/* Bubble Menu */}
          <BubbleMenu
            editor={editor}
            className="bubble-menu bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex items-center space-x-1"
          >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`btn btn-ghost p-1 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            >
              <Bold size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`btn btn-ghost p-1 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            >
              <Italic size={14} />
            </button>
          </BubbleMenu>

          {/* Floating Menu */}
          <FloatingMenu
            editor={editor}
            className="floating-menu bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex items-center space-x-1"
          >
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className="btn btn-ghost text-sm px-2 py-1"
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className="btn btn-ghost p-1"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className="btn btn-ghost p-1"
            >
              <Quote size={14} />
            </button>
          </FloatingMenu>

          {/* 에디터 */}
          <EditorContent
            editor={editor}
            className="min-h-[400px] focus:outline-none"
          />

          {/* 상태 바 */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{wordCount} 단어</span>
              {isAnalyzing && (
                <div className="flex items-center space-x-1">
                  <div className="loading-spinner w-3 h-3" />
                  <span>감정 분석 중...</span>
                </div>
              )}
              {emotionAnalysis && (
                <div className="flex items-center space-x-1">
                  <span>{EMOTION_EMOJIS[emotionAnalysis.primaryEmotion]}</span>
                  <span className="capitalize">{emotionAnalysis.primaryEmotion}</span>
                  <span>({Math.round(emotionAnalysis.confidence * 100)}%)</span>
                </div>
              )}
            </div>
            {lastSaved && (
              <span>
                마지막 저장: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* 감정 분석 패널 */}
        {showEmotionPanel && emotionAnalysis && (
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Smile className="mr-2" size={18} />
                감정 분석
              </h3>
              <div className="text-sm text-gray-600 mb-3">
                전체 점수: {emotionAnalysis.score > 0 ? '+' : ''}{emotionAnalysis.score.toFixed(1)}
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(emotionAnalysis.emotionScores)
                .filter(([, score]) => score > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([emotion, score]) => (
                  <EmotionIndicator
                    key={emotion}
                    emotion={emotion as EmotionType}
                    score={score}
                    isActive={emotion === emotionAnalysis.primaryEmotion}
                  />
                ))}
            </div>

            <div className="mt-4 p-3 bg-white rounded-lg">
              <div className="text-xs text-gray-500 mb-1">신뢰도</div>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${emotionAnalysis.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {Math.round(emotionAnalysis.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryEditor;