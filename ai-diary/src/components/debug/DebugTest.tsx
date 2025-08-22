import React, { useState } from 'react';
import { AlertTriangle, TestTube } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DebugTest: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  // Component that will throw an error when shouldThrow is true
  const ErrorComponent = () => {
    if (shouldThrow) {
      throw new Error('테스트 오류: Error Boundary 작동 확인');
    }
    return <div className="text-green-600">✅ 정상 작동 중</div>;
  };

  const triggerAsyncError = async () => {
    try {
      // Simulate async operation that might fail
      await new Promise((_, reject) => 
        setTimeout(() => reject(new Error('비동기 작업 실패')), 1000)
      );
    } catch (error) {
      console.error('Async error caught:', error);
      toast.error('비동기 작업에서 오류가 발생했습니다.');
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <TestTube className="w-5 h-5 text-yellow-600" />
        <h3 className="font-semibold text-yellow-800">디버그 테스트 패널</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShouldThrow(!shouldThrow)}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            {shouldThrow ? '오류 해제' : 'Error Boundary 테스트'}
          </button>
          <ErrorComponent />
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={triggerAsyncError}
            className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
          >
            비동기 오류 테스트
          </button>
          <span className="text-sm text-gray-600">콘솔과 토스트 메시지 확인</span>
        </div>

        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
          ⚠️ 개발 모드에서만 표시됩니다. 프로덕션에서는 자동으로 숨겨집니다.
        </div>
      </div>
    </div>
  );
};

// Only show in development
export default process.env.NODE_ENV === 'development' ? DebugTest : () => null;