/**
 * @fileoverview 이력서-채용공고 매칭 분석 애플리케이션의 메인 라우터 컴포넌트
 * @description React Router를 사용하여 애플리케이션의 주요 페이지들을 라우팅합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import { Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import Analyzer from "./pages/analyzer";
import HowItWorks from "./pages/how-it-works";
import KeywordDictionary from "./pages/keyword-dictionary";

/**
 * 메인 애플리케이션 컴포넌트
 * @description 애플리케이션의 라우팅 구조를 정의하고 각 페이지 컴포넌트를 렌더링합니다.
 *
 * @returns {JSX.Element} 라우팅이 설정된 애플리케이션 컴포넌트
 *
 * @example
 * ```tsx
 * <App />
 * ```
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/analyzer" element={<Analyzer />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/keyword-dictionary" element={<KeywordDictionary />} />
    </Routes>
  );
}

export default App;
