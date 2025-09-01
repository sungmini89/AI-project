/**
 * @fileoverview 메인 색상 팔레트 생성기 페이지 컴포넌트
 * 
 * 사용자가 키워드를 입력하고 색상 조화 규칙을 선택하여 
 * AI 기반 색상 팔레트를 생성하는 메인 페이지입니다.
 * 
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 * 
 * **주요 기능:**
 * - 키워드 기반 AI 색상 팔레트 생성
 * - 5가지 색상 조화 규칙 선택 (보색, 유사색, 삼원색 등)
 * - 실시간 접근성 검사 및 대비율 표시
 * - 다중 AI 서비스 지원 (Mock, Free API, Offline, Custom)
 * - 성능 모니터링 및 서비스 상태 표시
 * - 색상 코드 복사 및 내보내기 기능
 * 
 * **사용 예시:**
 * ```typescript
 * // 바다 테마의 보색 조화 팔레트 생성
 * const result = await generateColors('바다', 'complementary', {
 *   colorCount: 5
 * });
 * ```
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { 
  Palette, 
  Sparkles, 
  Image, 
  Settings,
  Info,
  Zap
} from 'lucide-react';

import { PaletteGenerator, HarmonySelector } from '../components/color';
import { EnhancedColorSwatch } from '../components/color/enhanced-color-swatch';
import { ColorService, generateColors, getServiceStatus } from '../services';
import type { HarmonyType, GeneratePaletteResult, HSLColor } from '../types/color';

/**
 * 메인 팔레트 생성기 페이지 컴포넌트
 * 
 * 키워드 입력, 조화 규칙 선택을 통한 AI 기반 색상 팔레트 생성과
 * 생성된 결과의 시각적 표시 및 상호작용을 담당하는 메인 페이지입니다.
 * 
 * **컴포넌트 구조:**
 * - PaletteGenerator: 키워드 입력 및 생성 버튼
 * - HarmonySelector: 색상 조화 규칙 선택
 * - EnhancedColorSwatch: 생성된 색상 표시 및 상호작용
 * - 서비스 상태 모니터링 및 성능 지표 표시
 * 
 * @component
 * @returns {JSX.Element} 팔레트 생성기 페이지
 */
const GeneratorPage: React.FC = () => {
  const [generatedResult, setGeneratedResult] = useState<GeneratePaletteResult | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [selectedHarmony, setSelectedHarmony] = useState<HarmonyType>('complementary');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showAccessibilityDetails] = useState<boolean>(true);
  const [serviceStatus, setServiceStatus] = useState<any>(null);

  // 서비스 인스턴스
  const colorService = new ColorService({
    mode: 'offline',
    primaryAPI: 'local',
    fallbackToOffline: true,
    enableHuggingFace: false,
    timeout: 10000
  });

  // 서비스 상태 로드
  useEffect(() => {
    const loadServiceStatus = () => {
      try {
        const status = getServiceStatus();
        setServiceStatus(status);
      } catch (error) {
        console.error('서비스 상태 로드 실패:', error);
      }
    };

    loadServiceStatus();

    // 설정 변경 이벤트 리스너
    const handleConfigUpdate = () => {
      loadServiceStatus();
    };

    window.addEventListener('ai-config-updated', handleConfigUpdate);
    return () => window.removeEventListener('ai-config-updated', handleConfigUpdate);
  }, []);

  // 팔레트 생성 핸들러
  const handlePaletteGenerated = async (_colors: HSLColor[], keyword: string, harmonyType: HarmonyType) => {
    setIsGenerating(true);
    setSelectedKeyword(keyword);
    setSelectedHarmony(harmonyType);

    try {
      // 새로운 AI 서비스 사용
      const aiResult = await generateColors(keyword, harmonyType, {
        colorCount: 5,
        baseColor: null
      });

      // ColorService로 추가 분석 및 접근성 검사
      const result = await colorService.generatePalette({
        keyword,
        harmonyType,
        colorCount: 5,
        includeAnalysis: true,
        includeAccessibility: true,
        customColors: aiResult.colors // AI가 생성한 색상 사용
      });
      
      // AI 서비스 정보 추가
      const enhancedResult = {
        ...result,
        aiSource: aiResult.source,
        aiConfidence: aiResult.confidence,
        processingTime: aiResult.processingTime
      };
      
      setGeneratedResult(enhancedResult as any);
    } catch (error) {
      console.error('팔레트 생성 실패:', error);
      
      // AI 서비스 실패 시 기본 ColorService만 사용
      try {
        const result = await colorService.generatePalette({
          keyword,
          harmonyType,
          colorCount: 5,
          includeAnalysis: true,
          includeAccessibility: true
        });
        
        setGeneratedResult(result);
      } catch (fallbackError) {
        console.error('fallback 팔레트 생성 실패:', fallbackError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // 조화 변경 핸들러
  const handleHarmonyChange = (harmony: HarmonyType) => {
    setSelectedHarmony(harmony);
  };

  // 접근성 점수에 따른 색상
  const getAccessibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* 헤더 */}
        <div className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Palette className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              AI 색상 팔레트 생성기
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            키워드와 색상 이론을 바탕으로 완벽한 색상 조합을 만들어보세요. 
            접근성까지 고려한 전문가급 팔레트를 생성합니다.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">AI 기반 생성</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-white/20">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">색상 이론 적용</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-white/20">
              <Settings className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">접근성 검증</span>
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-5 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 컨트롤 패널 */}
          <div className="xl:col-span-3 lg:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Palette className="w-4 h-4 text-white" />
                  </div>
                  팔레트 생성 도구
                </CardTitle>
                <CardDescription>
                  키워드를 입력하거나 색상 조화 이론을 선택하여 완벽한 팔레트를 만들어보세요
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8">
                <Tabs defaultValue="generate" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="generate" className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      팔레트 생성
                    </TabsTrigger>
                    <TabsTrigger value="harmony" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      색상 조화
                    </TabsTrigger>
                    <TabsTrigger value="keywords" className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      키워드 탐색
                    </TabsTrigger>
                  </TabsList>
              
                  <TabsContent value="generate" className="space-y-6 mt-8">
                    <PaletteGenerator
                      onPaletteGenerated={handlePaletteGenerated}
                      className="w-full"
                    />
                  </TabsContent>
                  
                  <TabsContent value="harmony" className="space-y-6 mt-8">
                    <HarmonySelector
                      selectedHarmony={selectedHarmony}
                      onHarmonyChange={handleHarmonyChange}
                      baseColor={generatedResult?.palette.baseColor}
                      className="w-full"
                    />
                  </TabsContent>
                  
                  <TabsContent value="keywords" className="space-y-6 mt-8">
                    <div className="text-center py-12 text-gray-500">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>키워드 제안 기능 준비 중입니다.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 결과 표시 */}
          <div className="xl:col-span-2 lg:col-span-1 space-y-6">
            <Card className="min-h-[600px] bg-white/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
              {/* 생성된 팔레트 */}
              {generatedResult && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>생성된 팔레트</span>
                      <Badge variant="outline" className="text-xs">
                        {generatedResult.source === 'local' ? '오프라인' : generatedResult.source.toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {generatedResult.palette.name}
                      <br />
                      <span className="text-xs text-gray-500">
                        키워드: "{selectedKeyword}" • 조화: {selectedHarmony}
                      </span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="grid gap-3">
                      {generatedResult.palette.colors.map((color, index) => (
                        <EnhancedColorSwatch
                          key={index}
                          color={color.hsl}
                          index={index}
                          showDetails={true}
                          showAccessibility={showAccessibilityDetails}
                          className="w-full"
                        />
                      ))}
                    </div>

                    {/* 접근성 요약 */}
                    {generatedResult.accessibility && (
                      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-600" />
                          접근성 분석
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">전체 점수</span>
                            <p className={`font-bold text-lg ${getAccessibilityColor(generatedResult.accessibility.overallScore)}`}>
                              {generatedResult.accessibility.overallScore}점
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">대비 평균</span>
                            <p className="font-bold text-lg text-gray-800">
                              {generatedResult.accessibility.averageContrast.toFixed(1)}:1
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI 서비스 상태 정보 */}
                    {serviceStatus && (generatedResult as any)?.aiSource && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200/50">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${serviceStatus.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                            <span className="font-medium text-gray-700">
                              {serviceStatus.currentMode.toUpperCase()} 모드 
                            </span>
                            <span className="text-gray-500">
                              | {(generatedResult as any).aiSource}
                            </span>
                          </div>
                          <div className="text-gray-500">
                            응답시간: {(generatedResult as any).processingTime || 0}ms
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </>
              )}

              {/* 로딩 상태 */}
              {isGenerating && (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                      <Sparkles className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <p className="text-gray-600 font-medium">팔레트 생성 중...</p>
                  </div>
                </div>
              )}

              {/* 초기 상태 */}
              {!generatedResult && !isGenerating && (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center space-y-6 max-w-md mx-auto p-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                      <Palette className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      팔레트를 생성해보세요
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      왼쪽에서 키워드를 입력하거나 색상 조화 이론을 선택하여 
                      아름다운 색상 팔레트를 만들어보세요.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* 하단 도움말 카드 */}
        <div className="mt-16">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="w-5 h-5 text-blue-600" />
                사용 가이드
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mt-2" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  한국어 키워드 입력 시 <span className="font-medium text-purple-700">감정과 분위기</span>를 표현하는 단어를 사용해보세요
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-medium text-blue-700">보색</span>은 강한 대비, <span className="font-medium text-green-700">유사색</span>은 자연스러운 조화를 만듭니다
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mt-2" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  접근성 점수 <span className="font-bold text-green-600">80점 이상</span>을 권장합니다
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mt-2" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-medium text-orange-600">색상 코드</span>를 클릭하면 클립보드에 복사됩니다
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GeneratorPage;