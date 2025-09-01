/**
 * 색상 이론 가이드 페이지
 * 색상 이론, 조화 규칙, 접근성에 대한 종합 가이드
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Palette, 
  Eye, 
  Target, 
  Lightbulb, 
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Heart,
  Sun,
  Moon,
  Droplets,
  Leaf
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

interface ColorHarmonyExample {
  type: string;
  name: string;
  description: string;
  colors: string[];
  useCase: string;
  pros: string[];
  cons: string[];
}

interface AccessibilityLevel {
  level: string;
  name: string;
  ratio: string;
  description: string;
  examples: string[];
}

const GuidePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('color-theory');

  const guideSections: GuideSection[] = [
    {
      id: 'color-theory',
      title: '색상 이론 기초',
      icon: <Palette className="h-5 w-5" />,
      description: '색상환, HSL, RGB 등 색상의 기본 원리'
    },
    {
      id: 'harmony-rules',
      title: '조화 규칙',
      icon: <Target className="h-5 w-5" />,
      description: '보색, 유사색 등 5가지 색상 조화 이론'
    },
    {
      id: 'accessibility',
      title: '접근성 가이드',
      icon: <Eye className="h-5 w-5" />,
      description: 'WCAG 기준 대비비 및 색맹 고려사항'
    },
    {
      id: 'psychology',
      title: '색상 심리학',
      icon: <Heart className="h-5 w-5" />,
      description: '색상이 인간의 감정과 행동에 미치는 영향'
    },
    {
      id: 'practical-tips',
      title: '실전 활용법',
      icon: <Lightbulb className="h-5 w-5" />,
      description: '브랜딩, 웹디자인에서의 실제 적용 방법'
    }
  ];

  const harmonyExamples: ColorHarmonyExample[] = [
    {
      type: 'complementary',
      name: '보색 (Complementary)',
      description: '색상환에서 정반대에 위치한 색상들의 조합',
      colors: ['#FF6B6B', '#4ECDC4'],
      useCase: '강한 대비와 주목성이 필요한 디자인',
      pros: ['높은 대비', '시각적 임팩트', '주의 집중'],
      cons: ['과도하면 피로감', '균형 잡기 어려움']
    },
    {
      type: 'analogous',
      name: '유사색 (Analogous)',
      description: '색상환에서 인접한 색상들의 자연스러운 조합',
      colors: ['#FF6B6B', '#FF8E6B', '#FFB06B'],
      useCase: '자연스럽고 편안한 느낌의 디자인',
      pros: ['조화로움', '자연스러움', '안정감'],
      cons: ['단조로울 수 있음', '대비 부족']
    },
    {
      type: 'triadic',
      name: '삼색조 (Triadic)',
      description: '색상환을 3등분한 지점의 세 색상',
      colors: ['#FF6B6B', '#6BFF6B', '#6B6BFF'],
      useCase: '균형잡힌 생동감 있는 디자인',
      pros: ['균형감', '다양성', '생동감'],
      cons: ['조화 난이도 높음', '색상 비율 중요']
    },
    {
      type: 'tetradic',
      name: '사색조 (Tetradic)',
      description: '두 쌍의 보색으로 구성된 네 색상',
      colors: ['#FF6B6B', '#6BFF6B', '#6B6BFF', '#FFB06B'],
      useCase: '풍부한 색상이 필요한 복합적 디자인',
      pros: ['다양한 표현', '풍부함', '유연성'],
      cons: ['복잡함', '균형 잡기 어려움']
    },
    {
      type: 'monochromatic',
      name: '단색조 (Monochromatic)',
      description: '하나의 색상에서 명도와 채도를 변화시킨 조합',
      colors: ['#FF6B6B', '#FF9999', '#FFB3B3', '#FFCCCC'],
      useCase: '세련되고 통일감 있는 미니멀 디자인',
      pros: ['통일감', '세련됨', '실패 위험 낮음'],
      cons: ['단조로움', '차별화 부족']
    }
  ];

  const accessibilityLevels: AccessibilityLevel[] = [
    {
      level: 'AAA',
      name: '최고 등급',
      ratio: '7:1',
      description: '가장 엄격한 기준으로 모든 사용자가 편리하게 사용',
      examples: ['정부 웹사이트', '의료 시스템', '교육 플랫폼']
    },
    {
      level: 'AA',
      name: '권장 등급',
      ratio: '4.5:1',
      description: '대부분의 웹사이트가 준수해야 하는 표준',
      examples: ['일반 웹사이트', '모바일 앱', '전자상거래']
    },
    {
      level: 'A',
      name: '최소 등급',
      ratio: '3:1',
      description: '기본적인 접근성 요구사항 충족',
      examples: ['개인 블로그', '실험적 디자인']
    }
  ];

  const koreanColorMeanings = [
    { color: '#FF0000', name: '빨강', meaning: '열정, 에너지, 사랑, 위험', culture: '행운, 축복 (전통 혼례)' },
    { color: '#FFA500', name: '주황', meaning: '활기, 창의성, 따뜻함', culture: '풍요, 수확 (가을 단풍)' },
    { color: '#FFFF00', name: '노랑', meaning: '기쁨, 지혜, 주의', culture: '황제, 권위 (황금색)' },
    { color: '#008000', name: '초록', meaning: '자연, 평화, 성장, 희망', culture: '생명력, 번영 (소나무)' },
    { color: '#0000FF', name: '파랑', meaning: '신뢰, 안정, 차분함', culture: '높은 이상, 청렴 (청자)' },
    { color: '#800080', name: '보라', meaning: '고귀함, 신비, 창의성', culture: '품격, 우아함 (왕실 색)' },
    { color: '#FFFFFF', name: '하양', meaning: '순수, 깨끗함, 시작', culture: '정화, 신성 (한복 백의)' },
    { color: '#000000', name: '검정', meaning: '격식, 권위, 신비', culture: '겸손, 절제 (먹색)' }
  ];

  const ColorTheorySection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">색상 이론의 기초</h2>
        <p className="text-muted-foreground mb-6">
          색상을 이해하고 효과적으로 활용하기 위한 기본 원리들을 알아보세요.
        </p>
      </div>

      {/* 색상환 */}
      <Card>
        <CardHeader>
          <CardTitle>색상환 (Color Wheel)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="w-48 h-48 mx-auto mb-4 rounded-full" 
                   style={{
                     background: `conic-gradient(
                       #ff0000 0deg, #ff8000 30deg, #ffff00 60deg, 
                       #80ff00 90deg, #00ff00 120deg, #00ff80 150deg,
                       #00ffff 180deg, #0080ff 210deg, #0000ff 240deg,
                       #8000ff 270deg, #ff00ff 300deg, #ff0080 330deg, #ff0000 360deg
                     )`
                   }}>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">색상의 3요소</h4>
                <ul className="space-y-2 text-sm">
                  <li><strong>색상(Hue):</strong> 색상환에서의 위치 (0-360도)</li>
                  <li><strong>채도(Saturation):</strong> 색상의 순수도 (0-100%)</li>
                  <li><strong>명도(Lightness):</strong> 색상의 밝기 (0-100%)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">색온도</h4>
                <ul className="space-y-2 text-sm">
                  <li><strong>따뜻한 색:</strong> 빨강, 주황, 노랑 계열</li>
                  <li><strong>차가운 색:</strong> 파랑, 초록, 보라 계열</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HSL vs RGB */}
      <Card>
        <CardHeader>
          <CardTitle>색상 표현 방식</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">HSL (Hue, Saturation, Lightness)</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">HSL(0, 100%, 50%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">HSL(240, 100%, 50%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">HSL(120, 100%, 50%)</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                직관적이고 색상 조화를 만들기 쉬움
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">RGB (Red, Green, Blue)</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">RGB(255, 0, 0)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">RGB(0, 0, 255)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">RGB(0, 255, 0)</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                디지털 디스플레이의 기본 방식
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const HarmonyRulesSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">색상 조화 규칙</h2>
        <p className="text-muted-foreground mb-6">
          5가지 주요 색상 조화 이론과 실제 적용 방법을 알아보세요.
        </p>
      </div>

      <div className="grid gap-6">
        {harmonyExamples.map((harmony, index) => (
          <motion.div
            key={harmony.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{harmony.name}</CardTitle>
                  <Badge variant="outline">{harmony.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {harmony.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-3">색상 예시</h4>
                    <div className="flex gap-2 mb-2">
                      {harmony.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-lg shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {harmony.useCase}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-green-700">장점</h4>
                    <ul className="text-sm space-y-1">
                      {harmony.pros.map((pro, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-amber-700">주의사항</h4>
                    <ul className="text-sm space-y-1">
                      {harmony.cons.map((con, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const AccessibilitySection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">접근성 가이드</h2>
        <p className="text-muted-foreground mb-6">
          모든 사용자가 편리하게 사용할 수 있는 색상 선택을 위한 지침입니다.
        </p>
      </div>

      {/* WCAG 대비비 기준 */}
      <Card>
        <CardHeader>
          <CardTitle>WCAG 대비비 기준</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {accessibilityLevels.map((level) => (
              <div key={level.level} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">WCAG {level.level} - {level.name}</h4>
                  <Badge variant={level.level === 'AAA' ? 'default' : level.level === 'AA' ? 'secondary' : 'outline'}>
                    {level.ratio}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {level.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {level.examples.map((example, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 색맹 고려사항 */}
      <Card>
        <CardHeader>
          <CardTitle>색맹 사용자 고려사항</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">색맹의 종류</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>적녹색맹 (8%):</strong> 빨강과 초록을 구별하기 어려움</li>
                <li><strong>청황색맹 (1%):</strong> 파랑과 노랑을 구별하기 어려움</li>
                <li><strong>전색맹 (0.01%):</strong> 모든 색상을 회색으로 인식</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">설계 원칙</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  색상 외에 모양, 텍스트로도 정보 전달
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  충분한 대비비 확보 (최소 4.5:1)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  문제가 되는 색상 조합 피하기
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  색맹 시뮬레이터로 테스트
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const PsychologySection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">색상 심리학</h2>
        <p className="text-muted-foreground mb-6">
          색상이 인간의 감정과 행동에 미치는 영향과 한국 문화에서의 의미를 알아보세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>색상별 심리적 효과와 문화적 의미</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {koreanColorMeanings.map((colorInfo, index) => (
              <motion.div
                key={colorInfo.color}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div
                  className="w-16 h-16 rounded-lg shadow-sm flex-shrink-0"
                  style={{ backgroundColor: colorInfo.color }}
                />
                <div className="flex-grow">
                  <h4 className="font-semibold text-lg mb-1">{colorInfo.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>심리적 효과:</strong> {colorInfo.meaning}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>한국 문화:</strong> {colorInfo.culture}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 계절별 색상 */}
      <Card>
        <CardHeader>
          <CardTitle>계절별 색상 팔레트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { season: '봄', colors: ['#FFB6C1', '#98FB98', '#FFFF99', '#DDA0DD'], icon: <Leaf className="h-4 w-4" /> },
              { season: '여름', colors: ['#87CEEB', '#F0E68C', '#FF6347', '#32CD32'], icon: <Sun className="h-4 w-4" /> },
              { season: '가을', colors: ['#D2691E', '#B22222', '#DAA520', '#8B4513'], icon: <Droplets className="h-4 w-4" /> },
              { season: '겨울', colors: ['#4682B4', '#708090', '#FFFFFF', '#2F4F4F'], icon: <Moon className="h-4 w-4" /> }
            ].map((seasonData) => (
              <div key={seasonData.season} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  {seasonData.icon}
                  <h4 className="font-semibold">{seasonData.season}</h4>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {seasonData.colors.map((color, i) => (
                    <div
                      key={i}
                      className="h-12 rounded"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const PracticalTipsSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">실전 활용법</h2>
        <p className="text-muted-foreground mb-6">
          브랜딩, 웹 디자인, 마케팅에서 색상을 효과적으로 활용하는 방법을 알아보세요.
        </p>
      </div>

      {/* 브랜드 색상 전략 */}
      <Card>
        <CardHeader>
          <CardTitle>브랜드 색상 전략</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-red-700">테크 기업</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-sm">신뢰, 혁신 (파랑)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-800 rounded"></div>
                  <span className="text-sm">고급스러움 (검정/회색)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border rounded"></div>
                  <span className="text-sm">깔끔함 (흰색)</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-green-700">친환경 브랜드</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span className="text-sm">자연, 건강 (초록)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-600 rounded"></div>
                  <span className="text-sm">따뜻함 (갈색)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-sky-500 rounded"></div>
                  <span className="text-sm">청정함 (하늘색)</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-purple-700">럭셔리 브랜드</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-800 rounded"></div>
                  <span className="text-sm">고급스러움 (보라)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span className="text-sm">프리미엄 (금색)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-black rounded"></div>
                  <span className="text-sm">권위 (검정)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 웹 디자인 팁 */}
      <Card>
        <CardHeader>
          <CardTitle>웹 디자인 색상 활용법</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">60-30-10 규칙</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded"></div>
                  <div>
                    <div className="font-medium">주 색상 (60%)</div>
                    <div className="text-xs text-muted-foreground">배경, 주요 영역</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-400 rounded"></div>
                  <div>
                    <div className="font-medium">보조 색상 (30%)</div>
                    <div className="text-xs text-muted-foreground">헤더, 사이드바</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded"></div>
                  <div>
                    <div className="font-medium">강조 색상 (10%)</div>
                    <div className="text-xs text-muted-foreground">버튼, 링크, CTA</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">모바일 고려사항</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-yellow-600" />
                  터치 타겟은 최소 44px 크기
                </li>
                <li className="flex items-center gap-2">
                  <Eye className="h-3 w-3 text-blue-600" />
                  높은 대비비로 가독성 확보
                </li>
                <li className="flex items-center gap-2">
                  <Sun className="h-3 w-3 text-orange-600" />
                  야외에서도 보이는 색상 선택
                </li>
                <li className="flex items-center gap-2">
                  <Info className="h-3 w-3 text-gray-600" />
                  다크모드 대응 색상 계획
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 마케팅 색상 팁 */}
      <Card>
        <CardHeader>
          <CardTitle>마케팅에서의 색상 활용</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">CTA 버튼 색상</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm">빨강</span>
                  <Badge className="bg-red-500">긴급성, 즉시성</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">초록</span>
                  <Badge className="bg-green-500">"계속", "확인"</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="text-sm">파랑</span>
                  <Badge className="bg-blue-500">신뢰, 안전</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-sm">주황</span>
                  <Badge className="bg-orange-500">친근함, 재미</Badge>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">A/B 테스트 팁</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                  <span>한 번에 하나의 색상만 변경하여 테스트</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                  <span>충분한 샘플 사이즈 확보 (최소 1000명)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                  <span>계절, 이벤트 등 외부 요인 고려</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                  <span>모바일과 데스크톱 별도 측정</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'color-theory': return <ColorTheorySection />;
      case 'harmony-rules': return <HarmonyRulesSection />;
      case 'accessibility': return <AccessibilitySection />;
      case 'psychology': return <PsychologySection />;
      case 'practical-tips': return <PracticalTipsSection />;
      default: return <ColorTheorySection />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">색상 이론 가이드</h1>
        <p className="text-muted-foreground">
          색상의 기본 이론부터 실전 활용법까지 포괄적인 가이드를 제공합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 사이드바 네비게이션 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                목차
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {guideSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "ghost"}
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <div className="flex items-start gap-3">
                      {section.icon}
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {section.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;