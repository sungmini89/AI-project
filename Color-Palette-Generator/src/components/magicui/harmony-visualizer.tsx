import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface HarmonyVisualizerProps {
  baseHue: number;
  harmonyType: 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic';
  size?: number;
  className?: string;
}

/**
 * 색상환에서 조화 관계를 시각적으로 보여주는 컴포넌트
 * 선택된 조화 규칙에 따라 색상 간의 관계를 애니메이션으로 표현
 */
export const HarmonyVisualizer: React.FC<HarmonyVisualizerProps> = ({
  baseHue,
  harmonyType,
  size = 200,
  className = ''
}) => {
  const radius = size / 2 - 20;
  const center = size / 2;

  // 조화 규칙에 따른 색상 각도 계산
  const harmonyAngles = useMemo(() => {
    const angles = [baseHue];
    
    switch (harmonyType) {
      case 'complementary':
        angles.push((baseHue + 180) % 360);
        break;
      case 'analogous':
        angles.push((baseHue - 30 + 360) % 360, (baseHue + 30) % 360);
        break;
      case 'triadic':
        angles.push((baseHue + 120) % 360, (baseHue + 240) % 360);
        break;
      case 'tetradic':
        angles.push(
          (baseHue + 90) % 360,
          (baseHue + 180) % 360,
          (baseHue + 270) % 360
        );
        break;
      case 'monochromatic':
        // 단색조는 같은 색상의 명도/채도 변화
        angles.push(baseHue, baseHue, baseHue, baseHue);
        break;
    }
    
    return angles;
  }, [baseHue, harmonyType]);

  // 각도에서 좌표 계산
  const getPosition = (angle: number, r: number = radius) => {
    const radian = (angle - 90) * (Math.PI / 180); // -90도로 12시 방향을 0도로 설정
    return {
      x: center + r * Math.cos(radian),
      y: center + r * Math.sin(radian)
    };
  };

  // HSL 색상 생성
  const getHSLColor = (hue: number, saturation: number = 70, lightness: number = 50) => {
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* 색상환 배경 */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg, ${Array.from({ length: 36 }, (_, i) => 
            `hsl(${i * 10}, 70%, 50%) ${i * 10}deg`
          ).join(', ')})`
        }}
      >
        {/* 원형 마스크 */}
        <defs>
          <mask id={`colorWheel-${baseHue}`}>
            <rect width={size} height={size} fill="black" />
            <circle cx={center} cy={center} r={radius} fill="white" />
            <circle cx={center} cy={center} r={radius - 20} fill="black" />
          </mask>
        </defs>
        <rect
          width={size}
          height={size}
          mask={`url(#colorWheel-${baseHue})`}
          className="rounded-full"
        />
      </svg>

      {/* 조화 색상 점들 */}
      {harmonyAngles.map((angle, index) => {
        const position = getPosition(angle);
        const isBase = index === 0;
        
        return (
          <motion.div
            key={`${angle}-${index}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: "backOut"
            }}
            className={`absolute rounded-full border-2 border-white shadow-lg ${
              isBase ? 'w-6 h-6 z-10' : 'w-4 h-4 z-5'
            }`}
            style={{
              left: position.x - (isBase ? 12 : 8),
              top: position.y - (isBase ? 12 : 8),
              backgroundColor: harmonyType === 'monochromatic' 
                ? getHSLColor(angle, 70, 30 + index * 15) // 단색조는 명도 변화
                : getHSLColor(angle)
            }}
          >
            {/* 기본 색상 표시 */}
            {isBase && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 bg-white px-1 py-0.5 rounded whitespace-nowrap">
                기본
              </div>
            )}
          </motion.div>
        );
      })}

      {/* 조화 선 그리기 */}
      <svg width={size} height={size} className="absolute inset-0 pointer-events-none">
        {harmonyAngles.slice(1).map((angle, index) => {
          const basePos = getPosition(harmonyAngles[0]);
          const targetPos = getPosition(angle);
          
          return (
            <motion.line
              key={`line-${angle}-${index}`}
              x1={basePos.x}
              y1={basePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="1"
              strokeDasharray="2,2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.3 + index * 0.1
              }}
            />
          );
        })}
      </svg>

      {/* 중앙 조화 타입 표시 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center bg-white bg-opacity-90 rounded-lg p-2 shadow-md"
        >
          <div className="text-sm font-semibold text-gray-800">
            {harmonyType === 'complementary' && '보색'}
            {harmonyType === 'analogous' && '유사색'}
            {harmonyType === 'triadic' && '삼색조'}
            {harmonyType === 'tetradic' && '사색조'}
            {harmonyType === 'monochromatic' && '단색조'}
          </div>
          <div className="text-xs text-gray-600">
            {harmonyAngles.length}개 색상
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface ColorWheelProps {
  selectedHue?: number;
  onHueChange?: (hue: number) => void;
  size?: number;
  className?: string;
}

/**
 * 인터랙티브 색상환 컴포넌트
 * 마우스/터치로 색상을 직접 선택할 수 있음
 */
export const ColorWheel: React.FC<ColorWheelProps> = ({
  selectedHue = 0,
  onHueChange,
  size = 200,
  className = ''
}) => {
  const radius = size / 2 - 10;
  const center = size / 2;

  const handleClick = (event: React.MouseEvent) => {
    if (!onHueChange) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    const hue = (angle + 90 + 360) % 360;
    
    onHueChange(Math.round(hue));
  };

  const selectedPosition = useMemo(() => {
    const radian = (selectedHue - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(radian),
      y: center + radius * Math.sin(radian)
    };
  }, [selectedHue, center, radius]);

  return (
    <div 
      className={`relative cursor-pointer ${className}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
    >
      {/* 색상환 배경 */}
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${Array.from({ length: 72 }, (_, i) => 
            `hsl(${i * 5}, 70%, 50%) ${i * 5}deg`
          ).join(', ')})`
        }}
      />

      {/* 내부 원형 구멍 */}
      <div 
        className="absolute bg-white rounded-full border-2 border-gray-200"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* 선택된 색상 포인터 */}
      <motion.div
        className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg z-10"
        style={{
          backgroundColor: `hsl(${selectedHue}, 70%, 50%)`,
          left: selectedPosition.x - 8,
          top: selectedPosition.y - 8
        }}
        animate={{
          left: selectedPosition.x - 8,
          top: selectedPosition.y - 8
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {/* 중앙 색상 정보 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-sm font-mono">
          <div className="font-semibold text-gray-700">
            {Math.round(selectedHue)}°
          </div>
          <div className="text-xs text-gray-500">
            색상
          </div>
        </div>
      </div>
    </div>
  );
};