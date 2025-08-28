import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileUpload } from '../components/FileUpload';
import { storageService } from '../services/storageService';
import { Trash2, AlertTriangle } from 'lucide-react';

/**
 * 파일 업로드 및 처리 페이지 컴포넌트
 * 학습 자료를 업로드하고 기존 데이터를 관리할 수 있는 페이지입니다.
 * 데이터 초기화 기능과 파일 업로드 처리 상태를 보여줍니다.
 * @returns {JSX.Element} 업로드 페이지 컴포넌트
 */
export default function Upload() {
  const [uploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isClearingData, setIsClearingData] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleProcessFiles = async () => {
    setIsProcessing(true);
    // 파일 처리 로직 (실제 구현은 services에서)
    await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션
    setIsProcessing(false);
  };

  const handleClearAllData = async () => {
    setIsClearingData(true);
    try {
      await storageService.clearAllData();
      setSuccessMessage('모든 기존 데이터가 성공적으로 삭제되었습니다. 이제 새로운 학습 자료를 업로드할 수 있습니다.');
      setErrorMessage(null);
      setShowClearConfirm(false);
      // 성공 메시지는 3초 후 자동 제거
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('데이터 삭제 오류:', error);
      setErrorMessage('데이터 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
      setSuccessMessage(null);
    } finally {
      setIsClearingData(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">학습 자료 업로드</h1>

      {/* 데이터 초기화 섹션 */}
      <Card className="p-6 mb-6 border-orange-200 bg-orange-50">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-orange-800 mb-2">기존 데이터 관리</h2>
            <p className="text-orange-700 mb-4 text-sm">
              새로운 학습 자료를 업로드하기 전에 기존 플래시카드, 퀴즈, 학습 진도를 초기화할 수 있습니다. 
              이 작업은 되돌릴 수 없으니 신중하게 선택하세요.
            </p>
            
            {!showClearConfirm ? (
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(true)}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
                disabled={isClearingData}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                모든 기존 데이터 삭제
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm font-medium mb-2">
                    ⚠️ 정말로 모든 데이터를 삭제하시겠습니까?
                  </p>
                  <p className="text-red-700 text-sm">
                    이 작업은 다음 데이터를 영구적으로 삭제합니다:
                  </p>
                  <ul className="text-red-700 text-sm mt-1 ml-4 list-disc">
                    <li>업로드한 모든 문서</li>
                    <li>생성된 모든 플래시카드</li>
                    <li>학습 세션 기록</li>
                    <li>학습 진도 데이터</li>
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClearConfirm(false)}
                    disabled={isClearingData}
                    className="text-gray-600"
                  >
                    취소
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllData}
                    disabled={isClearingData}
                    className="bg-red-600 text-white border-red-600 hover:bg-red-700"
                  >
                    {isClearingData ? '삭제 중...' : '확인, 모든 데이터 삭제'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 파일 업로드 영역 */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">파일 업로드</h2>
        <p className="text-gray-600 mb-4">
          텍스트 파일(.txt) 또는 PDF 파일(.pdf)을 업로드하세요.
          업로드된 파일은 자동으로 요약되고 플래시카드가 생성됩니다.
        </p>
        
        <FileUpload 
          onDocumentProcessed={(document, analysis) => {
            console.log('문서 처리 완료:', document, analysis);
            setSuccessMessage(`문서 "${document.title}"가 성공적으로 처리되었습니다! 플래시카드와 퀴즈가 자동으로 생성되었습니다. 대시보드나 플래시카드/퀴즈 메뉴에서 확인해보세요.`);
            setErrorMessage(null);
            // 성공 메시지는 5초 후 자동 제거 (더 많은 정보를 보여주므로)
            setTimeout(() => setSuccessMessage(null), 5000);
          }}
          onError={(error) => {
            console.error('파일 처리 오류:', error);
            setErrorMessage(error);
            setSuccessMessage(null);
          }}
        />

        {/* 성공/에러 메시지 */}
        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
              <span className="text-green-800">{successMessage}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                <span className="text-red-800">{errorMessage}</span>
              </div>
              <button 
                onClick={() => setErrorMessage(null)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">업로드된 파일</h3>
            <ul className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </li>
              ))}
            </ul>
            
            <Button 
              variant="outline"
              onClick={handleProcessFiles}
              disabled={isProcessing}
              className="mt-4 w-full"
            >
              {isProcessing ? '처리 중...' : '파일 처리하기'}
            </Button>
          </div>
        )}
      </Card>

      {/* 처리 진행 상황 */}
      {isProcessing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">처리 진행 상황</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse mr-3"></div>
              <span className="text-sm">텍스트 추출 중...</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
              <span className="text-sm text-gray-500">요약 생성 대기 중</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
              <span className="text-sm text-gray-500">키워드 추출 대기 중</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
              <span className="text-sm text-gray-500">플래시카드 생성 대기 중</span>
            </div>
          </div>
        </Card>
      )}

      {/* 처리 옵션 설정 */}
      <Card className="p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">처리 옵션</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">요약 길이</label>
            <select className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900">
              <option value="short">짧게 (3-5 문장)</option>
              <option value="medium">보통 (5-10 문장)</option>
              <option value="long">길게 (10-15 문장)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">생성할 플래시카드 수</label>
            <select className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900">
              <option value="auto">자동 (내용에 따라)</option>
              <option value="10">10개</option>
              <option value="20">20개</option>
              <option value="30">30개</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
}