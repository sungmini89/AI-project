import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Search, 
  Sparkles, 
  Heart, 
  Leaf, 
  Sun, 
  Brain, 
  Package,
  Lightbulb
} from 'lucide-react';

import { KeywordMapper } from '../../algorithms';
import type { KeywordMapping, KeywordCategory } from '../../algorithms';

interface KeywordSuggestionsProps {
  onKeywordSelect: (keyword: string) => void;
  selectedKeyword?: string;
  className?: string;
}

/**
 * 키워드 추천 및 검색 컴포넌트
 * 카테고리별 키워드 분류, 검색, 인기 키워드 표시
 */
export const KeywordSuggestions: React.FC<KeywordSuggestionsProps> = ({
  onKeywordSelect,
  selectedKeyword = '',
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<KeywordCategory | 'all'>('all');

  const keywordMapper = new KeywordMapper();

  // 카테고리별 키워드 그룹화
  const keywordsByCategory = useMemo(() => {
    return keywordMapper.getKeywordsByCategory();
  }, []);

  // 검색 결과
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return keywordMapper.searchKeywords(searchQuery.trim(), 10);
  }, [searchQuery]);

  // 선택된 카테고리의 키워드들
  const filteredKeywords = useMemo(() => {
    if (selectedCategory === 'all') {
      const allKeywords = keywordMapper.getAllKeywords();
      return allKeywords.map(keyword => keywordMapper.getKeywordInfo(keyword)).filter(Boolean) as KeywordMapping[];
    }
    return keywordMapper.getColorsByCategory(selectedCategory);
  }, [selectedCategory]);

  // 인기 키워드 (각 카테고리에서 대표적인 것들)
  const popularKeywords = useMemo(() => {
    const popular = [
      '평온함', '열정', '행복', '신뢰', // 감정
      '바다', '하늘', '숲', '꽃', // 자연
      '봄', '여름', '가을', '겨울', // 계절
      '미니멀', '럭셔리', '모던', '빈티지' // 추상
    ];
    return popular.map(keyword => keywordMapper.getKeywordInfo(keyword)).filter(Boolean) as KeywordMapping[];
  }, []);

  // 카테고리 정보
  const categoryInfo = {
    all: { name: '전체', icon: Package, color: 'bg-gray-100 text-gray-700' },
    emotion: { name: '감정', icon: Heart, color: 'bg-red-100 text-red-700' },
    nature: { name: '자연', icon: Leaf, color: 'bg-green-100 text-green-700' },
    season: { name: '계절', icon: Sun, color: 'bg-yellow-100 text-yellow-700' },
    abstract: { name: '추상', icon: Brain, color: 'bg-purple-100 text-purple-700' },
    object: { name: '사물', icon: Package, color: 'bg-blue-100 text-blue-700' },
    concept: { name: '개념', icon: Lightbulb, color: 'bg-orange-100 text-orange-700' }
  };

  const handleKeywordClick = (keyword: string) => {
    onKeywordSelect(keyword);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category as KeywordCategory | 'all');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            키워드 추천
          </CardTitle>
          <CardDescription>
            감정, 자연, 계절 등 다양한 카테고리의 키워드를 탐색하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색 입력 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="키워드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 검색 결과 */}
          {searchQuery && searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">검색 결과</h3>
              <div className="flex flex-wrap gap-2">
                {searchResults.map((result, index) => (
                  <Button
                    key={index}
                    variant={selectedKeyword === result.keyword ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleKeywordClick(result.keyword)}
                    className="text-xs"
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-2" 
                      style={{ backgroundColor: keywordMapper.mapKeywordToColor(result.keyword) ? 
                        `hsl(${keywordMapper.mapKeywordToColor(result.keyword).h}, 70%, 50%)` : '#gray' }}
                    />
                    {result.keyword}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 인기 키워드 (검색 중이 아닐 때만) */}
          {!searchQuery && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">인기 키워드</h3>
              <div className="flex flex-wrap gap-2">
                {popularKeywords.map((keyword, index) => (
                  <Button
                    key={index}
                    variant={selectedKeyword === keyword.keyword ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleKeywordClick(keyword.keyword)}
                    className="text-xs"
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-2" 
                      style={{ backgroundColor: `hsl(${keyword.color.h}, ${keyword.color.s}%, ${keyword.color.l}%)` }}
                    />
                    {keyword.keyword}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 카테고리별 키워드 (검색 중이 아닐 때만) */}
      {!searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 키워드</CardTitle>
            <CardDescription>
              원하는 분야의 키워드를 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
              <TabsList className="grid w-full grid-cols-6 mb-4">
                {Object.entries(categoryInfo).map(([key, info]) => {
                  const IconComponent = info.icon;
                  return (
                    <TabsTrigger 
                      key={key} 
                      value={key} 
                      className="text-xs flex items-center gap-1"
                    >
                      <IconComponent className="w-3 h-3" />
                      {info.name}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {Object.entries(categoryInfo).map(([categoryKey, info]) => (
                <TabsContent key={categoryKey} value={categoryKey} className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={info.color}>
                      <info.icon className="w-3 h-3 mr-1" />
                      {info.name} 카테고리
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {categoryKey === 'all' 
                        ? keywordMapper.getAllKeywords().length 
                        : keywordsByCategory[categoryKey as KeywordCategory]?.length || 0
                      }개 키워드
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {filteredKeywords.map((keyword, index) => (
                      <Card 
                        key={index}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedKeyword === keyword.keyword ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => handleKeywordClick(keyword.keyword)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                              style={{ backgroundColor: `hsl(${keyword.color.h}, ${keyword.color.s}%, ${keyword.color.l}%)` }}
                            />
                            <span className="font-medium text-sm">{keyword.keyword}</span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {keyword.description}
                          </p>
                          {keyword.synonyms.length > 0 && (
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-1">
                                {keyword.synonyms.slice(0, 2).map((synonym, i) => (
                                  <Badge key={i} variant="outline" className="text-xs py-0 px-1">
                                    {synonym}
                                  </Badge>
                                ))}
                                {keyword.synonyms.length > 2 && (
                                  <Badge variant="outline" className="text-xs py-0 px-1">
                                    +{keyword.synonyms.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};