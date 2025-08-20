import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { databaseService, DiaryEntry } from '../services/databaseService';
import { EMOTION_EMOJIS, EmotionType } from '../services/emotionAnalysisService';

const DiaryListPage: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState<EmotionType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'mood' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showPrivate, setShowPrivate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [entries, searchTerm, selectedMood, sortBy, sortOrder, showPrivate]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const allEntries = await databaseService.getEntries(1000, 0); // 모든 일기 로드
      setEntries(allEntries);
    } catch (error) {
      console.error('일기 목록 로드 실패:', error);
      toast.error('일기 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...entries];

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 감정 필터
    if (selectedMood !== 'all') {
      filtered = filtered.filter(entry => entry.mood === selectedMood);
    }

    // 프라이빗 필터
    if (!showPrivate) {
      filtered = filtered.filter(entry => !entry.isPrivate);
    }

    // 정렬
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'date':
          compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        case 'mood':
          compareValue = a.mood.localeCompare(b.mood);
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredEntries(filtered);
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm('정말로 이 일기를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await databaseService.deleteEntry(entryId);
      toast.success('일기가 삭제되었습니다.');
      loadEntries();
    } catch (error) {
      console.error('일기 삭제 실패:', error);
      toast.error('일기 삭제에 실패했습니다.');
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getEmotionColor = (mood: EmotionType) => {
    const colors = {
      happy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      sad: 'bg-blue-100 text-blue-800 border-blue-200',
      angry: 'bg-red-100 text-red-800 border-red-200',
      neutral: 'bg-gray-100 text-gray-800 border-gray-200',
      excited: 'bg-pink-100 text-pink-800 border-pink-200',
      calm: 'bg-green-100 text-green-800 border-green-200',
      anxious: 'bg-purple-100 text-purple-800 border-purple-200',
      proud: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      disappointed: 'bg-slate-100 text-slate-800 border-slate-200',
      grateful: 'bg-amber-100 text-amber-800 border-amber-200',
    };
    return colors[mood] || colors.neutral;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">일기 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">일기 목록</h1>
            <p className="text-gray-600 dark:text-gray-400">
              총 {entries.length}개의 일기 • {filteredEntries.length}개 표시 중
            </p>
          </div>
          
          <Link
            to="/write"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 일기 작성
          </Link>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft border border-gray-200 dark:border-gray-700 p-6 mb-6">
          {/* 검색바 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="일기 제목, 내용, 태그로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-5 h-5 mr-2" />
              필터
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* 필터 옵션 */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* 감정 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  감정
                </label>
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value as EmotionType | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">모든 감정</option>
                  {Object.entries(EMOTION_EMOJIS).map(([emotion, emoji]) => (
                    <option key={emotion} value={emotion}>
                      {emoji} {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 정렬 기준 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  정렬 기준
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'mood' | 'title')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="date">날짜</option>
                  <option value="title">제목</option>
                  <option value="mood">감정</option>
                </select>
              </div>

              {/* 정렬 순서 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  정렬 순서
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="desc">내림차순 (최신순)</option>
                  <option value="asc">오름차순 (오래된순)</option>
                </select>
              </div>
            </div>
          )}

          {/* 프라이빗 토글 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              비공개 일기 포함
            </span>
            <button
              onClick={() => setShowPrivate(!showPrivate)}
              className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                showPrivate
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {showPrivate ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
              {showPrivate ? '포함' : '제외'}
            </button>
          </div>
        </div>

        {/* 일기 목록 */}
        {filteredEntries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {entries.length === 0 ? '아직 작성된 일기가 없어요' : '검색 결과가 없어요'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {entries.length === 0 
                ? '첫 번째 일기를 작성해보세요!'
                : '다른 검색어나 필터를 시도해보세요.'
              }
            </p>
            {entries.length === 0 && (
              <Link
                to="/write"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-5 h-5 mr-2" />
                일기 작성하기
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-soft border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {entry.title}
                        </h3>
                        {entry.isPrivate && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            <EyeOff className="w-3 h-3 mr-1" />
                            비공개
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(entry.date).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEmotionColor(entry.mood)}`}>
                          <span className="mr-1">{EMOTION_EMOJIS[entry.mood]}</span>
                          <span className="capitalize">{entry.mood}</span>
                        </div>
                        <span>{entry.wordCount} 단어</span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {truncateContent(entry.content)}
                      </p>
                      
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {entry.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.updatedAt).toLocaleString('ko-KR')} 수정됨
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/write/${entry.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        수정
                      </Link>
                      
                      <button
                        onClick={() => handleDeleteEntry(entry.id!)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryListPage;