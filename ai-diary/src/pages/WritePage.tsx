import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, Save } from 'lucide-react';
import DiaryEditor from '../components/editor/DiaryEditor';
import { databaseService, DiaryEntry } from '../services/databaseService';

const WritePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [existingEntry, setExistingEntry] = useState<DiaryEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 기존 일기 로드 (수정 모드)
  useEffect(() => {
    if (id) {
      loadExistingEntry(parseInt(id));
    }
  }, [id]);

  const loadExistingEntry = async (entryId: number) => {
    try {
      setIsLoading(true);
      const entry = await databaseService.getEntry(entryId);
      if (entry) {
        setExistingEntry(entry);
        setIsEditing(true);
      } else {
        toast.error('일기를 찾을 수 없습니다.');
        navigate('/');
      }
    } catch (error) {
      console.error('일기 로드 실패:', error);
      toast.error('일기를 불러오는 중 오류가 발생했습니다.');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  // 저장 핸들러
  const handleSave = async (entry: Partial<DiaryEntry>) => {
    try {
      setIsLoading(true);
      
      if (isEditing && existingEntry?.id) {
        // 기존 일기 수정
        await databaseService.updateEntry(existingEntry.id, entry);
        toast.success('일기가 수정되었습니다.');
      } else {
        // 새 일기 생성
        await databaseService.addEntry(entry as Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success('일기가 저장되었습니다.');
      }
      
      // 목록으로 이동
      navigate('/');
    } catch (error) {
      console.error('저장 실패:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 뒤로가기 확인
  const handleGoBack = () => {
    // TODO: 변경사항이 있을 경우 확인 다이얼로그
    navigate('/');
  };

  if (isLoading && isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-600">일기를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="btn btn-ghost p-2 hover:bg-gray-100 rounded-lg"
                title="뒤로가기"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEditing ? '일기 수정' : '새 일기 작성'}
                </h1>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar size={16} className="mr-1" />
                  <span>{new Date().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                  })}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* 모바일에서 보이는 저장 버튼 */}
              <button 
                className="btn btn-primary sm:hidden"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loading-spinner w-4 h-4" />
                ) : (
                  <Save size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <DiaryEditor
            initialContent={existingEntry?.htmlContent || ''}
            initialTitle={existingEntry?.title || ''}
            onSave={handleSave}
            autoSave={true}
            autoSaveInterval={30000}
            className="min-h-[600px]"
          />
        </div>

        {/* 도움말 패널 (데스크톱에만 표시) */}
        <div className="hidden lg:block mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">💡 작성 팁</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 감정 분석이 실시간으로 진행됩니다</li>
              <li>• Ctrl+S로 언제든지 저장할 수 있습니다</li>
              <li>• 태그를 추가하여 일기를 분류해보세요</li>
              <li>• 비공개 모드로 개인적인 내용을 보호할 수 있습니다</li>
            </ul>
          </div>
        </div>
      </main>

      {/* 하단 액션 바 (모바일) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:hidden">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            자동 저장 활성화
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">
              {isEditing ? '수정 중' : '작성 중'}
            </span>
            {isLoading && (
              <div className="loading-spinner w-4 h-4" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritePage;