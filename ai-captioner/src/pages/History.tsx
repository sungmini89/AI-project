import { useState, useEffect } from "react";

/**
 * 캡션 히스토리 인터페이스
 *
 * @interface CaptionHistory
 * @property {string} id - 고유 식별자
 * @property {string} imageUrl - 이미지 URL
 * @property {string} caption - 생성된 캡션
 * @property {Date} timestamp - 생성 시간
 * @property {string} mode - 사용된 AI 모드
 */
interface CaptionHistory {
  id: string;
  imageUrl: string;
  caption: string;
  timestamp: Date;
  mode: string;
}

/**
 * 생성 히스토리 페이지 컴포넌트
 *
 * @description
 * - 사용자가 생성한 모든 캡션의 기록을 표시
 * - 로컬 스토리지에서 히스토리 데이터 로드
 * - 개별 항목 삭제 및 전체 삭제 기능
 * - 이미지, 캡션, 생성 시간, AI 모드 정보 표시
 *
 * @returns {JSX.Element} 히스토리 페이지 컴포넌트
 */
export default function History() {
  // 상태 관리
  const [history, setHistory] = useState<CaptionHistory[]>([]); // 히스토리 데이터 배열
  const [loading, setLoading] = useState(true); // 로딩 상태

  /**
   * 컴포넌트 마운트 시 히스토리 데이터를 로드하는 useEffect
   */
  useEffect(() => {
    // 로컬 스토리지에서 히스토리 데이터 로드
    const loadHistory = () => {
      try {
        const savedHistory = localStorage.getItem("captionHistory");
        if (savedHistory) {
          // JSON 파싱 후 timestamp를 Date 객체로 변환
          const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }));
          setHistory(parsedHistory);
        }
      } catch (error) {
        console.error("히스토리 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  /**
   * 모든 히스토리를 삭제하는 함수
   */
  const clearHistory = () => {
    if (window.confirm("모든 히스토리를 삭제하시겠습니까?")) {
      localStorage.removeItem("captionHistory");
      setHistory([]);
    }
  };

  /**
   * 특정 히스토리 항목을 삭제하는 함수
   *
   * @param {string} id - 삭제할 항목의 ID
   */
  const deleteItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("captionHistory", JSON.stringify(updatedHistory));
  };

  // 로딩 중일 때 스피너 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">생성 히스토리</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          AI가 생성한 이미지 캡션들의 기록을 확인할 수 있습니다.
        </p>
        {/* 전체 삭제 버튼 - 히스토리가 있을 때만 표시 */}
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            전체 삭제
          </button>
        )}
      </div>

      {/* 히스토리 콘텐츠 */}
      {history.length === 0 ? (
        // 히스토리가 없을 때 표시할 빈 상태
        <div className="text-center py-16">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📷</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            아직 생성된 캡션이 없습니다
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            이미지를 업로드하여 첫 번째 캡션을 생성해보세요!
          </p>
        </div>
      ) : (
        // 히스토리 그리드 표시
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {/* 이미지 영역 */}
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt="Generated caption"
                  className="w-full h-48 object-cover"
                />
                {/* AI 모드 배지 */}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    {item.mode}
                  </span>
                </div>
                {/* 삭제 버튼 */}
                <button
                  onClick={() => deleteItem(item.id)}
                  className="absolute top-2 left-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                >
                  ×
                </button>
              </div>

              {/* 캡션 및 메타데이터 영역 */}
              <div className="p-4">
                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-3">
                  {item.caption}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.timestamp.toLocaleString("ko-KR")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
