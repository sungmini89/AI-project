import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccessibilityIndicatorProps {
  contrastRatio: number;
  level: 'AA' | 'AAA' | 'FAIL';
  isAnimating?: boolean;
  className?: string;
}

/**
 * WCAG 접근성 대비율 변화를 실시간으로 표시하는 애니메이션 컴포넌트
 * 대비율 변화에 따른 시각적 피드백 제공
 */
export const AccessibilityIndicator: React.FC<AccessibilityIndicatorProps> = ({
  contrastRatio,
  level,
  isAnimating = false,
  className = ''
}) => {
  const getColorByLevel = (level: string) => {
    switch (level) {
      case 'AAA': return '#059669'; // 녹색
      case 'AA': return '#d97706';  // 주황
      case 'FAIL': return '#dc2626'; // 빨강
      default: return '#6b7280';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'AAA': return '최상 (AAA)';
      case 'AA': return '양호 (AA)';
      case 'FAIL': return '불충족';
      default: return '확인 중';
    }
  };

  const getDescription = (level: string) => {
    switch (level) {
      case 'AAA': return '7:1 이상 - 최고 수준 접근성';
      case 'AA': return '4.5:1 이상 - 표준 접근성';
      case 'FAIL': return '4.5:1 미만 - 접근성 개선 필요';
      default: return '';
    }
  };

  // 진행률 계산 (0-100%)
  const getProgress = () => {
    const maxRatio = 10; // 표시할 최대 대비율
    return Math.min((contrastRatio / maxRatio) * 100, 100);
  };

  return (
    <div className={`bg-white rounded-lg p-4 shadow-md ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">접근성 대비율</h3>
        <AnimatePresence mode="wait">
          <motion.div
            key={level}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-1"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getColorByLevel(level) }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: getColorByLevel(level) }}
            >
              {getLevelText(level)}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 대비율 숫자 표시 */}
      <div className="text-center mb-4">
        <motion.div
          key={contrastRatio}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold text-gray-800"
        >
          {contrastRatio.toFixed(1)}:1
        </motion.div>
        <div className="text-xs text-gray-500 mt-1">
          {getDescription(level)}
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: getColorByLevel(level) }}
          initial={{ width: 0 }}
          animate={{ width: `${getProgress()}%` }}
          transition={{
            duration: isAnimating ? 0.8 : 0.3,
            ease: "easeOut"
          }}
        />
        
        {/* AA 기준선 (4.5:1) */}
        <div
          className="absolute top-0 w-0.5 h-full bg-orange-500 opacity-60"
          style={{ left: '45%' }}
        />
        
        {/* AAA 기준선 (7:1) */}
        <div
          className="absolute top-0 w-0.5 h-full bg-green-600 opacity-60"
          style={{ left: '70%' }}
        />
      </div>

      {/* 기준선 범례 */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>0:1</span>
        <div className="flex space-x-4">
          <span className="text-orange-500">AA (4.5:1)</span>
          <span className="text-green-600">AAA (7:1)</span>
        </div>
        <span>10:1+</span>
      </div>

      {/* 개선 제안 (접근성이 부족한 경우) */}
      <AnimatePresence>
        {level === 'FAIL' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 p-2 bg-red-50 rounded border-l-4 border-red-400"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">
                <p className="text-sm text-red-700">
                  <strong>개선 방법:</strong>
                </p>
                <ul className="text-xs text-red-600 mt-1 list-disc list-inside">
                  <li>더 어두운 색상 사용</li>
                  <li>더 밝은 배경색 선택</li>
                  <li>색상 대신 패턴이나 아이콘 활용</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ColorBlindSimulatorProps {
  originalColor: string;
  type: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'normal';
  className?: string;
}

/**
 * 색맹 시뮬레이션 컴포넌트
 * 선택된 색상이 다양한 색맹 유형에서 어떻게 보이는지 시각화
 */
export const ColorBlindSimulator: React.FC<ColorBlindSimulatorProps> = ({
  originalColor,
  type,
  className = ''
}) => {
  // 색맹 시뮬레이션 필터 적용
  const getSimulatedColor = (color: string, simulationType: string) => {
    // 실제로는 더 정교한 색맹 시뮬레이션 알고리즘이 필요
    // 여기서는 간단한 근사값 사용
    const tempDiv = document.createElement('div');
    tempDiv.style.color = color;
    document.body.appendChild(tempDiv);
    const computedColor = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);

    // RGB 파싱 (간단한 예시)
    const rgb = computedColor.match(/\d+/g);
    if (!rgb) return color;

    let [r, g, b] = rgb.map(Number);

    switch (simulationType) {
      case 'protanopia': // 적록색맹 (L-cone 결함)
        r = r * 0.567 + g * 0.433;
        g = g * 0.558 + b * 0.442;
        break;
      case 'deuteranopia': // 적록색맹 (M-cone 결함)
        r = r * 0.625 + g * 0.375;
        g = g * 0.7 + b * 0.3;
        break;
      case 'tritanopia': // 청황색맹 (S-cone 결함)
        g = g * 0.95 + b * 0.05;
        b = b * 0.433 + r * 0.567;
        break;
      default:
        return color;
    }

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'protanopia': return '적록색맹 (P형)';
      case 'deuteranopia': return '적록색맹 (D형)';
      case 'tritanopia': return '청황색맹 (T형)';
      case 'normal': return '일반 시야';
      default: return type;
    }
  };

  const simulatedColor = type === 'normal' ? originalColor : getSimulatedColor(originalColor, type);

  return (
    <div className={`${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        {/* 색상 샘플 */}
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
            style={{ backgroundColor: simulatedColor }}
          />
          <div>
            <div className="text-sm font-medium text-gray-700">
              {getTypeLabel(type)}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {simulatedColor}
            </div>
          </div>
        </div>

        {/* 변화 정도 표시 */}
        {type !== 'normal' && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xs text-gray-500"
          >
            {originalColor === simulatedColor ? '변화 없음' : '색상 변화 감지됨'}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};