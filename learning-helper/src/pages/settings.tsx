/**
 * 설정 페이지
 * AI 서비스 설정과 기타 앱 설정을 관리합니다
 */
import React, { useState } from 'react';
import AIServiceSettings from '@/components/AIServiceSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, RotateCcw } from 'lucide-react';
import { storageService } from '@/services/storageService';

const SettingsPage: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAllData = async () => {
    const confirmed = confirm(
      '⚠️ 경고: 모든 데이터를 삭제하시겠습니까?\n\n' +
      '다음 데이터가 영구적으로 삭제됩니다:\n' +
      '• 업로드한 모든 문서\n' +
      '• 생성된 모든 플래시카드\n' +
      '• 퀴즈 기록\n' +
      '• 학습 진도\n\n' +
      '이 작업은 되돌릴 수 없습니다.'
    );

    if (!confirmed) return;

    // 두 번째 확인
    const doubleConfirmed = confirm(
      '정말로 모든 데이터를 삭제하시겠습니까?\n\n' +
      '마지막 확인입니다. 이 작업은 되돌릴 수 없습니다.'
    );

    if (!doubleConfirmed) return;

    try {
      setIsClearing(true);
      await storageService.clearAllData();
      alert('모든 데이터가 성공적으로 삭제되었습니다.');
      
      // 페이지 새로고침하여 초기 상태로 되돌리기
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('데이터 삭제 오류:', error);
      alert('데이터 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearFlashcards = async () => {
    const confirmed = confirm(
      '학습 데이터를 모두 삭제하시겠습니까?\n\n' +
      '다음 데이터가 삭제됩니다:\n' +
      '• 생성된 모든 플래시카드\n' +
      '• 모든 학습 세션 기록\n' +
      '• 학습 진도 데이터\n\n' +
      '문서는 그대로 유지됩니다.'
    );

    if (!confirmed) return;

    try {
      setIsClearing(true);
      
      // 모든 학습 데이터 삭제 (플래시카드, 세션, 진도)
      await storageService.clearStudyData();
      
      alert('모든 학습 데이터가 삭제되었습니다.');
    } catch (error) {
      console.error('학습 데이터 삭제 오류:', error);
      alert('학습 데이터 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8 space-y-8">
        <AIServiceSettings />
        
        {/* 데이터 관리 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              데이터 관리
            </CardTitle>
            <CardDescription>
              학습 데이터를 초기화하거나 관리할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 학습 데이터 초기화 */}
            <div className="flex items-start gap-4 p-4 border border-orange-200 rounded-lg bg-orange-50">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-900">학습 데이터 초기화</h4>
                <p className="text-sm text-orange-700 mt-1">
                  모든 플래시카드, 학습 세션, 진도 데이터를 삭제합니다. 문서는 유지됩니다.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFlashcards}
                  disabled={isClearing}
                  className="mt-2 border-orange-200 text-orange-700 hover:bg-orange-100"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  학습 데이터 초기화
                </Button>
              </div>
            </div>

            {/* 전체 데이터 초기화 */}
            <div className="flex items-start gap-4 p-4 border border-red-200 rounded-lg bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900">전체 데이터 초기화</h4>
                <p className="text-sm text-red-700 mt-1">
                  모든 문서, 플래시카드, 퀴즈, 학습 기록을 완전히 삭제합니다.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllData}
                  disabled={isClearing}
                  className="mt-2 border-red-200 text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {isClearing ? '삭제 중...' : '전체 초기화'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;