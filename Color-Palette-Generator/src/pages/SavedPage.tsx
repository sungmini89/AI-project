import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Heart, 
  Search, 
  Download, 
  Trash2, 
  Copy,
  Filter,
  SortAsc,
  Archive,
  Palette
} from 'lucide-react';

import { ColorTheory } from '../algorithms';
import type { ColorPalette, HarmonyType, ColorSwatch } from '../types/color';

interface SavedPalette extends ColorPalette {
  name: string; // 필수로 재정의
  isFavorite: boolean;
  usageCount: number;
  lastUsed: Date;
  category?: 'warm' | 'cool' | 'neutral' | 'vibrant' | 'pastel';
  tags: string[];
}

/**
 * 저장된 팔레트 관리 페이지
 * 팔레트 컬렉션, 검색, 필터링, 내보내기 기능
 */
const SavedPage: React.FC = () => {
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorites' | HarmonyType>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'usage'>('date');
  const [selectedPalettes, setSelectedPalettes] = useState<Set<string>>(new Set());

  const colorTheory = new ColorTheory();

  // localStorage에서 팔레트 로드
  useEffect(() => {
    loadSavedPalettes();
  }, []);

  const loadSavedPalettes = () => {
    try {
      const saved = localStorage.getItem('saved-palettes');
      if (saved) {
        const palettes = JSON.parse(saved) as SavedPalette[];
        setSavedPalettes(palettes);
      } else {
        // 데모 데이터 생성
        const demoData = generateDemoData();
        setSavedPalettes(demoData);
        localStorage.setItem('saved-palettes', JSON.stringify(demoData));
      }
    } catch (error) {
      console.error('팔레트 로딩 실패:', error);
    }
  };

  // 데모 데이터 생성
  const generateDemoData = (): SavedPalette[] => {
    const demoKeywords = [
      { keyword: '바다', harmony: 'analogous' as HarmonyType, favorite: true },
      { keyword: '봄', harmony: 'complementary' as HarmonyType, favorite: false },
      { keyword: '럭셔리', harmony: 'monochromatic' as HarmonyType, favorite: true },
      { keyword: '열정', harmony: 'triadic' as HarmonyType, favorite: false },
      { keyword: '평온함', harmony: 'tetradic' as HarmonyType, favorite: false }
    ];

    return demoKeywords.map((demo, index) => {
      const baseHue = index * 72; // 72도씩 분산
      const baseColor = { h: baseHue, s: 70, l: 50 };
      const hslColors = colorTheory.generateHarmony(baseColor, demo.harmony);
      
      // HSLColor를 ColorSwatch로 변환
      const colors: ColorSwatch[] = hslColors.map((hsl, colorIndex) => ({
        id: `color-${index}-${colorIndex}`,
        hex: colorTheory.hslToHex(hsl),
        rgb: colorTheory.hslToRgb(hsl),
        hsl
      }));
      
      return {
        id: `demo-${index}`,
        name: `${demo.keyword} - ${getHarmonyName(demo.harmony)}`,
        colors,
        harmonyType: demo.harmony,
        baseColor,
        confidence: 0.8,
        keyword: demo.keyword,
        createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000), // 하루씩 이전
        isFavorite: demo.favorite,
        tags: [demo.keyword, getHarmonyName(demo.harmony)],
        usageCount: Math.floor(Math.random() * 10) + 1,
        lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        accessibilityScore: Math.floor(Math.random() * 40) + 60, // 60-100 사이의 점수
        source: 'offline' as const
      };
    });
  };

  // 조화 타입 한국어 이름
  const getHarmonyName = (harmonyType: HarmonyType): string => {
    switch (harmonyType) {
      case 'complementary': return '보색';
      case 'analogous': return '유사색';
      case 'triadic': return '삼색조';
      case 'tetradic': return '사색조';
      case 'monochromatic': return '단색조';
      default: return harmonyType;
    }
  };

  // 필터링된 팔레트
  const filteredPalettes = savedPalettes
    .filter(palette => {
      // 검색 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return palette.name.toLowerCase().includes(query) ||
               palette.tags.some((tag: string) => tag.toLowerCase().includes(query));
      }
      return true;
    })
    .filter(palette => {
      // 카테고리 필터
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'favorites') return palette.isFavorite;
      return palette.harmonyType === selectedFilter;
    })
    .sort((a, b) => {
      // 정렬
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return b.usageCount - a.usageCount;
        default:
          return 0;
      }
    });

  // 즐겨찾기 토글
  const toggleFavorite = (paletteId: string) => {
    const updated = savedPalettes.map(palette => 
      palette.id === paletteId 
        ? { ...palette, isFavorite: !palette.isFavorite }
        : palette
    );
    setSavedPalettes(updated);
    localStorage.setItem('saved-palettes', JSON.stringify(updated));
  };

  // 팔레트 삭제
  const deletePalette = (paletteId: string) => {
    const updated = savedPalettes.filter(palette => palette.id !== paletteId);
    setSavedPalettes(updated);
    localStorage.setItem('saved-palettes', JSON.stringify(updated));
    setSelectedPalettes(prev => {
      const newSet = new Set(prev);
      newSet.delete(paletteId);
      return newSet;
    });
  };

  // 선택 토글
  const toggleSelection = (paletteId: string) => {
    setSelectedPalettes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paletteId)) {
        newSet.delete(paletteId);
      } else {
        newSet.add(paletteId);
      }
      return newSet;
    });
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedPalettes.size === filteredPalettes.length) {
      setSelectedPalettes(new Set());
    } else {
      setSelectedPalettes(new Set(filteredPalettes.map(p => p.id)));
    }
  };

  // 선택된 팔레트 삭제
  const deleteSelected = () => {
    const updated = savedPalettes.filter(palette => !selectedPalettes.has(palette.id));
    setSavedPalettes(updated);
    localStorage.setItem('saved-palettes', JSON.stringify(updated));
    setSelectedPalettes(new Set());
  };

  // 팔레트 내보내기
  const exportPalette = (palette: SavedPalette, format: 'json' | 'css' | 'ase') => {
    let content = '';
    let filename = `${palette.name.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;

    switch (format) {
      case 'json':
        content = JSON.stringify(palette, null, 2);
        break;
      case 'css':
        content = `:root {\n${palette.colors.map((color, index) => 
          `  --color-${index + 1}: ${color.hex};`
        ).join('\n')}\n}`;
        break;
      case 'ase':
        // Adobe Swatch Exchange 형식은 실제로는 바이너리이지만, 여기서는 텍스트로 대체
        content = palette.colors.map((color, index) => 
          `Color ${index + 1}: ${color.hex}`
        ).join('\n');
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Archive className="w-8 h-8 text-purple-600" />
            저장된 팔레트
          </h1>
          <p className="text-gray-600 mt-2">
            생성한 팔레트를 관리하고 다양한 형식으로 내보낼 수 있습니다
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            총 {savedPalettes.length}개
          </Badge>
          {savedPalettes.filter(p => p.isFavorite).length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              즐겨찾기 {savedPalettes.filter(p => p.isFavorite).length}개
            </Badge>
          )}
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* 검색 */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="팔레트 이름이나 태그로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 필터 */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">전체</option>
                <option value="favorites">즐겨찾기</option>
                <option value="complementary">보색</option>
                <option value="analogous">유사색</option>
                <option value="triadic">삼색조</option>
                <option value="tetradic">사색조</option>
                <option value="monochromatic">단색조</option>
              </select>
            </div>

            {/* 정렬 */}
            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm"
              >
                <option value="date">생성일 순</option>
                <option value="name">이름 순</option>
                <option value="usage">사용빈도 순</option>
              </select>
            </div>
          </div>

          {/* 대량 작업 */}
          {selectedPalettes.size > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-600">
                {selectedPalettes.size}개 선택됨
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelected}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                선택 삭제
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPalettes(new Set())}
              >
                선택 해제
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 팔레트 그리드 */}
      {filteredPalettes.length > 0 ? (
        <div className="space-y-4">
          {/* 전체 선택 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedPalettes.size === filteredPalettes.length && filteredPalettes.length > 0}
              onChange={toggleSelectAll}
              className="rounded"
            />
            <span className="text-sm text-gray-600">전체 선택</span>
          </div>

          {/* 팔레트 목록 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPalettes.map(palette => (
              <Card key={palette.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedPalettes.has(palette.id)}
                        onChange={() => toggleSelection(palette.id)}
                        className="rounded"
                      />
                      <div>
                        <CardTitle className="text-base">{palette.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {new Date(palette.createdAt || new Date()).toLocaleDateString('ko-KR')}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(palette.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Heart className={`w-4 h-4 ${palette.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 색상 미리보기 */}
                  <div className="flex h-8 rounded overflow-hidden">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1"
                        style={{ backgroundColor: color.hex }}
                        title={color.hex}
                      />
                    ))}
                  </div>

                  {/* 태그 */}
                  <div className="flex flex-wrap gap-1">
                    {palette.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* 사용 정보 */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>사용 {palette.usageCount}회</span>
                    <span>{new Date(palette.lastUsed).toLocaleDateString('ko-KR')}</span>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportPalette(palette, 'css')}
                      className="flex-1 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      CSS
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportPalette(palette, 'json')}
                      className="flex-1 text-xs"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deletePalette(palette.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* 빈 상태 */
        <Card className="text-center py-12">
          <CardContent>
            <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || selectedFilter !== 'all' 
                ? '조건에 맞는 팔레트가 없습니다'
                : '저장된 팔레트가 없습니다'}
            </h3>
            <p className="text-gray-600 text-sm">
              {searchQuery || selectedFilter !== 'all'
                ? '다른 검색어나 필터를 시도해보세요'
                : '팔레트 생성기에서 새로운 팔레트를 만들어보세요'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavedPage;