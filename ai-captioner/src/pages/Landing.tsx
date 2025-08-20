import { Link } from "react-router-dom";

/**
 * 랜딩 페이지 컴포넌트
 *
 * @description
 * - AI 이미지 캡션 생성기 서비스 소개
 * - 주요 기능 설명
 * - 생성 예시 제공
 * - 사용 방법 가이드
 * - 사용자 유도 CTA 섹션
 *
 * @returns {JSX.Element} 랜딩 페이지 컴포넌트
 */
export default function Landing() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero Section - 메인 소개 */}
      <section className="text-center mb-16">
        <div className="text-6xl mb-6">🤖✨</div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          AI 이미지 캡션 생성기
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          이미지를 업로드하면 SEO, SNS, 접근성 목적에 맞춘 한국어 캡션을 자동으로 생성해드립니다.
          다양한 AI 모드를 지원하여 언제 어디서나 사용할 수 있습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/app"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            지금 시작하기
          </Link>
          <Link
            to="/history"
            className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors font-semibold text-lg"
          >
            히스토리 보기
          </Link>
        </div>
      </section>

      {/* Features Section - 주요 기능 소개 */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          주요 기능
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* 다양한 AI 모드 */}
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              다양한 AI 모드
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              오프라인(Ollama), Free API, Premium API, Mock 모드를 지원하여 다양한 환경에서 사용할
              수 있습니다.
            </p>
          </div>

          {/* 목적별 최적화 */}
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              목적별 최적화
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              SEO, SNS, 접근성 등 사용 목적에 맞춘 최적화된 캡션을 생성합니다.
            </p>
          </div>

          {/* 히스토리 관리 */}
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">💾</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              히스토리 관리
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              생성된 모든 캡션을 저장하고 관리할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Examples Section - 생성 예시 */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          생성 예시
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* SEO 최적화 예시 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
              <h3 className="text-white font-semibold text-center">SEO 최적화</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                "고층 빌딩과 노을 하늘이 어우러진 도심 야경, 석양, 여진, 스카이라인, 도시 풍경, 건축
                사진, 여행지, 관광 명소"
              </p>
            </div>
          </div>

          {/* SNS 친화적 예시 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4">
              <h3 className="text-white font-semibold text-center">SNS 친화적</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                "오늘 하늘 미쳤다… 🌇✨ 도시의 석양이 너무 아름다워서 계속 바라보고 있어요 #도시야경
                #석양 #여행"
              </p>
            </div>
          </div>

          {/* 접근성 향상 예시 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4">
              <h3 className="text-white font-semibold text-center">접근성 향상</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                "노을빛이 비치는 하늘 아래 고층 건물이 줄지어 선 도시 풍경. 건물들은 검은색
                실루엣으로 보이며, 하늘은 주황색과 빨간색이 섞인 색상입니다."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Guide Section - 사용 방법 */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          사용 방법
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-8">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {/* 1단계: 이미지 업로드 */}
            <div>
              <div className="text-3xl mb-3">1️⃣</div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">이미지 업로드</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                드래그 앤 드롭으로 이미지를 업로드하세요
              </p>
            </div>

            {/* 2단계: 모드 선택 */}
            <div>
              <div className="text-3xl mb-3">2️⃣</div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">모드 선택</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                사용할 AI 모드를 선택하세요
              </p>
            </div>

            {/* 3단계: 캡션 생성 */}
            <div>
              <div className="text-3xl mb-3">3️⃣</div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">캡션 생성</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                AI가 자동으로 캡션을 생성합니다
              </p>
            </div>

            {/* 4단계: 저장 및 공유 */}
            <div>
              <div className="text-3xl mb-3">4️⃣</div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">저장 및 공유</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                생성된 캡션을 저장하고 공유하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - 행동 유도 */}
      <section className="text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">지금 바로 시작해보세요!</h2>
          <p className="text-xl mb-8 opacity-90">AI의 힘으로 이미지에 생명을 불어넣어보세요</p>
          <Link
            to="/app"
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg inline-block"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>
    </div>
  );
}
