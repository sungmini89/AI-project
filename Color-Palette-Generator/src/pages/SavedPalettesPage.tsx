/**
 * 저장된 팔레트 관리 페이지
 * 로컬 저장소 기반 팔레트 보관 및 관리
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Trash2, 
  Copy, 
  Search, 
  Filter,
  Star,
  Calendar,
  Palette,
  Share2,
  Edit3,
  Tag
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import type { ColorPalette } from '../types/color';

interface SavedPalette extends ColorPalette {
  tags: string[];
  favorite: boolean;
  usageCount: number;
  lastUsed: Date;
}

interface FilterOptions {
  search: string;
  harmonyType: string;
  favorite: boolean;
  dateRange: string;
  tags: string[];
}

const SavedPalettesPage: React.FC = () => {
  const [palettes, setPalettes] = useState<SavedPalette[]>([]);
  const [filteredPalettes, setFilteredPalettes] = useState<SavedPalette[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    harmonyType: 'all',
    favorite: false,
    dateRange: 'all',
    tags: []
  });
  const [selectedPalettes, setSelectedPalettes] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'date' | 'usage' | 'name'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadSavedPalettes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [palettes, filters, sortBy]);

  const loadSavedPalettes = (): void => {
    try {
      const saved = localStorage.getItem('saved-color-palettes');
      if (saved) {
        const parsed = JSON.parse(saved).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          lastUsed: new Date(p.lastUsed || p.createdAt)
        }));
        setPalettes(parsed);
      }
    } catch (error) {
      console.error('저장된 팔레트 로딩 실패:', error);
      setPalettes([]);
    }
  };

  const savePalettes = (newPalettes: SavedPalette[]): void => {
    try {
      localStorage.setItem('saved-color-palettes', JSON.stringify(newPalettes));
      setPalettes(newPalettes);
    } catch (error) {
      console.error('팔레트 저장 실패:', error);
    }
  };

  const applyFilters = (): void => {
    let filtered = [...palettes];

    // 검색 필터
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.keyword?.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // 조화 타입 필터
    if (filters.harmonyType !== 'all') {
      filtered = filtered.filter(p => p.harmonyType === filters.harmonyType);
    }

    // 즐겨찾기 필터
    if (filters.favorite) {
      filtered = filtered.filter(p => p.favorite);
    }

    // 날짜 범위 필터
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(p => p.createdAt >= filterDate);
    }

    // 태그 필터
    if (filters.tags.length > 0) {
      filtered = filtered.filter(p => 
        filters.tags.every(tag => p.tags.includes(tag))
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredPalettes(filtered);
  };

  const toggleFavorite = (paletteId: string): void => {
    const updated = palettes.map(p => 
      p.id === paletteId ? { ...p, favorite: !p.favorite } : p
    );
    savePalettes(updated);
  };

  const deletePalette = (paletteId: string): void => {
    const updated = palettes.filter(p => p.id !== paletteId);
    savePalettes(updated);
    setSelectedPalettes(prev => {
      const newSet = new Set(prev);
      newSet.delete(paletteId);
      return newSet;
    });
  };

  const deleteSelectedPalettes = (): void => {
    const updated = palettes.filter(p => !selectedPalettes.has(p.id));
    savePalettes(updated);
    setSelectedPalettes(new Set());
  };

  const copyPaletteColors = (palette: SavedPalette): void => {
    const colors = palette.colors.map(c => c.hex).join(', ');
    navigator.clipboard.writeText(colors);
    // TODO: Toast 알림 추가
  };

  const exportPalette = (palette: SavedPalette, format: 'css' | 'json' | 'ase'): void => {
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'css':
        content = `:root {\n${palette.colors.map((c, i) => 
          `  --color-${i + 1}: ${c.hex};`
        ).join('\n')}\n}`;
        filename = `${palette.name}-colors.css`;
        mimeType = 'text/css';
        break;
        
      case 'json':
        content = JSON.stringify(palette, null, 2);
        filename = `${palette.name}-palette.json`;
        mimeType = 'application/json';
        break;
        
      case 'ase':
        // Adobe Swatch Exchange format (simplified)
        content = palette.colors.map(c => `${c.hex}\t${c.hex}`).join('\n');
        filename = `${palette.name}-colors.ase`;
        mimeType = 'text/plain';
        break;
        
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addTag = (paletteId: string, tag: string): void => {
    const updated = palettes.map(p => 
      p.id === paletteId 
        ? { ...p, tags: [...new Set([...p.tags, tag.trim()])] }
        : p
    );
    savePalettes(updated);
  };

  const removeTag = (paletteId: string, tagToRemove: string): void => {
    const updated = palettes.map(p => 
      p.id === paletteId 
        ? { ...p, tags: p.tags.filter(tag => tag !== tagToRemove) }
        : p
    );
    savePalettes(updated);
  };

  const getAllTags = (): string[] => {
    const allTags = palettes.flatMap(p => p.tags);
    return [...new Set(allTags)].sort();
  };

  const PaletteCard: React.FC<{ palette: SavedPalette }> = ({ palette }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          {/* 색상 미리보기 */}
          <div className="h-24 flex">
            {palette.colors.map((color, index) => (
              <div
                key={index}
                className="flex-1 cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: color.hex }}
                onClick={() => copyPaletteColors(palette)}
                title={`${color.hex} 클릭하여 복사`}
              />
            ))}
          </div>
          
          {/* 즐겨찾기 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-black/20 hover:bg-black/40"
            onClick={() => toggleFavorite(palette.id)}
          >
            <Star 
              className={`h-4 w-4 ${palette.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-white'}`} 
            />
          </Button>
        </div>
        
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium truncate">
              {palette.name}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {palette.harmonyType}
            </Badge>
          </div>
          
          {palette.keyword && (
            <p className="text-xs text-muted-foreground">
              키워드: {palette.keyword}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* 태그 */}
          {palette.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {palette.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {palette.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{palette.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* 메타 정보 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {palette.createdAt.toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              사용 {palette.usageCount}회
            </span>
          </div>
          
          {/* 액션 버튼들 */}
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyPaletteColors(palette)}
              title="색상 코드 복사"
            >
              <Copy className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportPalette(palette, 'css')}
              title="CSS로 내보내기"
            >
              <Download className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* TODO: 공유 기능 */}}
              title="공유하기"
            >
              <Share2 className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => deletePalette(palette.id)}
              title="삭제"
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">저장된 팔레트</h1>
        <p className="text-muted-foreground">
          생성하고 저장한 색상 팔레트를 관리하세요. 총 {palettes.length}개의 팔레트가 저장되어 있습니다.
        </p>
      </div>

      {/* 필터 및 검색 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="팔레트 검색..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            {/* 조화 타입 필터 */}
            <select
              value={filters.harmonyType}
              onChange={(e) => setFilters(prev => ({ ...prev, harmonyType: e.target.value }))}
              className="border border-input bg-background px-3 py-2 text-sm rounded-md"
            >
              <option value="all">모든 조화 타입</option>
              <option value="complementary">보색</option>
              <option value="analogous">유사색</option>
              <option value="triadic">삼색조</option>
              <option value="tetradic">사색조</option>
              <option value="monochromatic">단색조</option>
            </select>
            
            {/* 날짜 범위 필터 */}
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="border border-input bg-background px-3 py-2 text-sm rounded-md"
            >
              <option value="all">전체 기간</option>
              <option value="today">오늘</option>
              <option value="week">최근 7일</option>
              <option value="month">최근 한달</option>
            </select>
            
            {/* 정렬 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-input bg-background px-3 py-2 text-sm rounded-md"
            >
              <option value="date">최신순</option>
              <option value="usage">사용빈도순</option>
              <option value="name">이름순</option>
            </select>
          </div>
          
          {/* 추가 필터 */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.favorite}
                  onChange={(e) => setFilters(prev => ({ ...prev, favorite: e.target.checked }))}
                  className="rounded"
                />
                즐겨찾기만
              </label>
            </div>
            
            {selectedPalettes.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelectedPalettes}
              >
                선택된 {selectedPalettes.size}개 삭제
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 팔레트 그리드 */}
      {filteredPalettes.length === 0 ? (
        <div className="text-center py-12">
          <Palette className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">저장된 팔레트가 없습니다</h3>
          <p className="text-muted-foreground">
            색상 팔레트를 생성하고 저장하면 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPalettes.map(palette => (
            <PaletteCard key={palette.id} palette={palette} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPalettesPage;