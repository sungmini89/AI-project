import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Loader2, Palette, Sparkles, Wand2 } from 'lucide-react';

import { ColorTheory, KeywordMapper, AccessibilityChecker } from '../../algorithms';
import type { HSLColor, HarmonyType, KeywordMapping } from '../../algorithms';
import { HarmonyVisualizer } from '../magicui/harmony-visualizer';

interface PaletteGeneratorProps {
  onPaletteGenerated?: (colors: HSLColor[], keyword: string, harmonyType: HarmonyType) => void;
  className?: string;
}

/**
 * 메인 팔레트 생성 인터페이스
 * 한국어 키워드 입력과 5가지 조화 규칙을 통한 색상 팔레트 생성
 */
export const PaletteGenerator: React.FC<PaletteGeneratorProps> = ({
  onPaletteGenerated,
  className = ''
}) => {
  const [keyword, setKeyword] = useState<string>('');
  const [harmonyType, setHarmonyType] = useState<HarmonyType>('complementary');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [, setGeneratedPalette] = useState<HSLColor[]>([]);
  const [keywordSuggestions, setKeywordSuggestions] = useState<KeywordMapping[]>([]);
  const [keywordInfo, setKeywordInfo] = useState<KeywordMapping | null>(null);
  
  // 알고리즘 인스턴스
  const colorTheory = new ColorTheory();
  const keywordMapper = new KeywordMapper();
  const accessibilityChecker = new AccessibilityChecker();

  // 키워드 입력 변경 시 추천 키워드 업데이트
  useEffect(() => {
    if (keyword.length > 0) {
      const suggestions = keywordMapper.searchKeywords(keyword, 5);
      setKeywordSuggestions(suggestions);
      
      // 정확한 매치가 있으면 키워드 정보 표시
      const exactMatch = suggestions.find(s => 
        s.keyword.toLowerCase() === keyword.toLowerCase()
      );
      setKeywordInfo(exactMatch || null);
    } else {
      setKeywordSuggestions([]);
      setKeywordInfo(null);
    }
  }, [keyword]);

  // 팔레트 생성 핸들러
  const handleGeneratePalette = async () => {
    if (!keyword.trim()) return;

    setIsGenerating(true);
    
    try {
      // 키워드를 색상으로 매핑
      const baseColor = keywordMapper.mapKeywordToColor(keyword);
      
      // 선택된 조화 규칙 적용
      const colors = colorTheory.generateHarmony(baseColor, harmonyType);
      
      // 접근성 최적화 적용
      const optimizedColors = accessibilityChecker.optimizePaletteAccessibility(colors);
      
      // 결과 저장
      setGeneratedPalette(optimizedColors);
      
      // 콜백 호출
      onPaletteGenerated?.(optimizedColors, keyword, harmonyType);
      
    } catch (error) {
      console.error('팔레트 생성 실패:', error);
    } finally {
      // 생성 애니메이션을 위한 지연
      setTimeout(() => {
        setIsGenerating(false);
      }, 1000);
    }
  };

  // 랜덤 키워드 선택
  const handleRandomKeyword = () => {
    const randomKeywords = keywordMapper.getRandomKeywords(1);
    if (randomKeywords.length > 0) {
      setKeyword(randomKeywords[0].keyword);
    }
  };

  // 키워드 제안 클릭
  const handleSuggestionClick = (suggestion: KeywordMapping) => {
    setKeyword(suggestion.keyword);
  };

  // 조화 타입 설명
  const getHarmonyDescription = (type: HarmonyType): string => {
    switch (type) {
      case 'complementary':
        return '보색 - 강한 대비와 임팩트';
      case 'analogous':
        return '유사색 - 자연스럽고 조화로운';
      case 'triadic':
        return '삼색조 - 균형잡힌 활기참';
      case 'tetradic':
        return '사색조 - 풍부하고 복잡한';
      case 'monochromatic':
        return '단색조 - 세련되고 통일감';
      default:
        return '';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 키워드 입력 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            키워드로 색상 생성
          </CardTitle>
          <CardDescription>
            감정, 자연, 계절 등의 키워드를 입력하여 AI가 색상 팔레트를 생성합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">키워드 입력</Label>
            <div className="flex gap-2">
              <Input
                id="keyword"
                data-testid="keyword-input"
                aria-label="색상 팔레트 생성을 위한 키워드 입력"
                placeholder="예: 평온함, 바다, 봄, 열정..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGeneratePalette()}
                className="flex-1"
                tabIndex={0}
                autoFocus
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleRandomKeyword}
                title="랜덤 키워드"
                aria-label="랜덤 키워드 선택"
                tabIndex={0}
              >
                <Wand2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 키워드 정보 */}
          {keywordInfo && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{keywordInfo.category === 'emotion' ? '감정' : 
                  keywordInfo.category === 'nature' ? '자연' :
                  keywordInfo.category === 'season' ? '계절' :
                  keywordInfo.category === 'abstract' ? '추상' :
                  keywordInfo.category === 'object' ? '사물' : '개념'}</Badge>
                <span className="font-medium">{keywordInfo.keyword}</span>
              </div>
              <p className="text-sm text-gray-600">{keywordInfo.description}</p>
              {keywordInfo.synonyms.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">관련 키워드: </span>
                  {keywordInfo.synonyms.slice(0, 3).map((synonym, index) => (
                    <Badge key={index} variant="outline" className="ml-1 text-xs">
                      {synonym}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 키워드 제안 */}
          {keywordSuggestions.length > 0 && !keywordInfo && (
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">추천 키워드</Label>
              <div className="flex flex-wrap gap-2">
                {keywordSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSuggestionClick(suggestion);
                      }
                    }}
                    className="text-xs"
                    tabIndex={0}
                    aria-label={`키워드 "${suggestion.keyword}" 선택`}
                  >
                    {suggestion.keyword}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 조화 규칙 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-green-500" />
            색상 조화 규칙
          </CardTitle>
          <CardDescription>
            색상 이론에 기반한 5가지 조화 규칙 중 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={harmonyType} onValueChange={(value) => setHarmonyType(value as HarmonyType)}>
            <TabsList className="grid w-full grid-cols-5" data-testid="harmony-select" role="tablist" aria-label="색상 조화 규칙 선택">
              <TabsTrigger value="complementary" className="text-xs" data-testid="harmony-option-complementary">보색</TabsTrigger>
              <TabsTrigger value="analogous" className="text-xs" data-testid="harmony-option-analogous">유사색</TabsTrigger>
              <TabsTrigger value="triadic" className="text-xs" data-testid="harmony-option-triadic">삼색조</TabsTrigger>
              <TabsTrigger value="tetradic" className="text-xs" data-testid="harmony-option-tetradic">사색조</TabsTrigger>
              <TabsTrigger value="monochromatic" className="text-xs" data-testid="harmony-option-monochromatic">단색조</TabsTrigger>
            </TabsList>
            <TabsContent value={harmonyType} className="mt-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">{getHarmonyDescription(harmonyType)}</h3>
                {keywordInfo && (
                  <HarmonyVisualizer
                    baseHue={keywordMapper.mapKeywordToColor(keyword).h}
                    harmonyType={harmonyType}
                    size={150}
                    className="mx-auto"
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 생성 버튼 */}
      <div className="text-center">
        <Button
          onClick={handleGeneratePalette}
          disabled={!keyword.trim() || isGenerating}
          size="lg"
          className="px-8"
          data-testid="generate-button"
          aria-label="키워드와 조화 규칙을 이용해 색상 팔레트 생성하기"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" data-testid="loading-indicator" />
              팔레트 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              팔레트 생성하기
            </>
          )}
        </Button>
      </div>

    </div>
  );
};