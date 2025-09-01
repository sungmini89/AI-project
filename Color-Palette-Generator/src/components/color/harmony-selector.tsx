import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

import { HarmonyVisualizer } from '../magicui/harmony-visualizer';
import type { HarmonyType, HSLColor } from '../../algorithms';

interface HarmonySelectorProps {
  selectedHarmony: HarmonyType;
  onHarmonyChange: (harmony: HarmonyType) => void;
  baseColor?: HSLColor;
  className?: string;
}

interface HarmonyInfo {
  type: HarmonyType;
  name: string;
  description: string;
  detailedDescription: string;
  useCases: string[];
  colorCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  characteristics: string[];
}

/**
 * 색상 조화 규칙 선택 컴포넌트
 * 5가지 조화 규칙에 대한 상세 설명과 시각적 미리보기 제공
 */
export const HarmonySelector: React.FC<HarmonySelectorProps> = ({
  selectedHarmony,
  onHarmonyChange,
  baseColor = { h: 200, s: 70, l: 50 },
  className = ''
}) => {
  const harmonies: HarmonyInfo[] = [
    {
      type: 'complementary',
      name: '보색 조화',
      description: '색상환에서 정반대에 위치한 색상의 조합',
      detailedDescription: '강한 대비 효과로 시각적 임팩트가 매우 큰 조합입니다. 주목도를 높이고 싶을 때 효과적이지만, 과도하게 사용하면 눈의 피로를 줄 수 있어 균형이 중요합니다.',
      useCases: ['브랜드 로고', 'CTA 버튼', '강조 요소', '포스터 디자인'],
      colorCount: 5,
      difficulty: 'beginner',
      characteristics: ['강한 대비', '높은 주목도', '역동적', '임팩트']
    },
    {
      type: 'analogous',
      name: '유사색 조화',
      description: '색상환에서 인접한 30도 범위 내의 색상 조합',
      detailedDescription: '자연에서 흔히 볼 수 있는 조화로운 색상 관계입니다. 편안하고 안정적인 느낌을 주며, 그라데이션 효과가 아름답게 표현됩니다.',
      useCases: ['자연 테마', '배경 디자인', '그라데이션', '브랜딩'],
      colorCount: 5,
      difficulty: 'beginner',
      characteristics: ['자연스러움', '조화로움', '편안함', '안정감']
    },
    {
      type: 'triadic',
      name: '삼색조 조화',
      description: '색상환을 3등분하여 120도 간격의 색상 조합',
      detailedDescription: '균형잡힌 활기찬 조합으로, 보색만큼 강렬하지 않으면서도 충분한 대비를 제공합니다. 다채로우면서도 조화로운 디자인을 만들 수 있습니다.',
      useCases: ['일러스트레이션', '게임 UI', '어린이 디자인', '축제 테마'],
      colorCount: 6,
      difficulty: 'intermediate',
      characteristics: ['균형감', '활기참', '다채로움', '안정된 대비']
    },
    {
      type: 'tetradic',
      name: '사색조 조화',
      description: '색상환에서 90도 간격으로 배치된 4개 색상의 조합',
      detailedDescription: '가장 풍부하고 복잡한 색상 조합입니다. 많은 색상을 사용하므로 균형을 맞추기 어렵지만, 잘 활용하면 매우 풍부한 시각적 효과를 낼 수 있습니다.',
      useCases: ['복잡한 인포그래픽', '예술 작품', '전문가용 디자인', '다양한 카테고리 표현'],
      colorCount: 6,
      difficulty: 'advanced',
      characteristics: ['풍부함', '복잡성', '전문적', '다양성']
    },
    {
      type: 'monochromatic',
      name: '단색조 조화',
      description: '하나의 색상을 명도와 채도 변화로 다양하게 표현',
      detailedDescription: '가장 세련되고 통일감 있는 조합입니다. 미니멀한 디자인에 적합하며, 색상 충돌의 위험이 없어 안전한 선택입니다.',
      useCases: ['미니멀 디자인', '기업 브랜딩', '모노톤 테마', '전문 문서'],
      colorCount: 5,
      difficulty: 'beginner',
      characteristics: ['통일감', '세련됨', '미니멀', '안전함']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return difficulty;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>색상 조화 규칙 선택</CardTitle>
          <CardDescription>
            색상 이론에 기반한 5가지 조화 규칙 중에서 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={selectedHarmony} 
            onValueChange={(value) => onHarmonyChange(value as HarmonyType)}
          >
            <TabsList className="grid w-full grid-cols-5 mb-6">
              {harmonies.map(harmony => (
                <TabsTrigger 
                  key={harmony.type} 
                  value={harmony.type}
                  className="text-xs"
                >
                  {harmony.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {harmonies.map(harmony => (
              <TabsContent key={harmony.type} value={harmony.type} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 조화 설명 */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{harmony.name}</h3>
                        <Badge className={getDifficultyColor(harmony.difficulty)}>
                          {getDifficultyText(harmony.difficulty)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {harmony.description}
                      </p>
                      <p className="text-sm leading-relaxed">
                        {harmony.detailedDescription}
                      </p>
                    </div>

                    {/* 특성 */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">특성</h4>
                      <div className="flex flex-wrap gap-1">
                        {harmony.characteristics.map((char, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 활용 사례 */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">활용 사례</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {harmony.useCases.map((useCase, index) => (
                          <div key={index} className="text-xs text-gray-600 flex items-center">
                            <div className="w-1 h-1 bg-blue-500 rounded-full mr-2" />
                            {useCase}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 색상 개수 */}
                    <div className="text-xs text-gray-500">
                      생성 색상: {harmony.colorCount}개
                    </div>
                  </div>

                  {/* 시각적 미리보기 */}
                  <div className="flex items-center justify-center">
                    <div className="space-y-4 text-center">
                      <HarmonyVisualizer
                        baseHue={baseColor.h}
                        harmonyType={harmony.type}
                        size={200}
                        className="mx-auto"
                      />
                      <div className="text-xs text-gray-500">
                        기본 색상: {Math.round(baseColor.h)}°
                      </div>
                    </div>
                  </div>
                </div>

                {/* 조화 규칙 수학적 설명 */}
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm mb-2">색상 이론</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      {harmony.type === 'complementary' && (
                        <p>• 기본 색상에서 180° 회전한 색상 사용</p>
                      )}
                      {harmony.type === 'analogous' && (
                        <p>• 기본 색상을 중심으로 ±30°, ±60° 범위의 색상 사용</p>
                      )}
                      {harmony.type === 'triadic' && (
                        <p>• 기본 색상에서 120°, 240° 간격으로 색상 선택</p>
                      )}
                      {harmony.type === 'tetradic' && (
                        <p>• 기본 색상에서 90°, 180°, 270° 간격으로 색상 선택</p>
                      )}
                      {harmony.type === 'monochromatic' && (
                        <p>• 동일한 색상(H)에서 채도(S)와 명도(L) 값만 변경</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};