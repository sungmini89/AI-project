import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { EmotionType, EMOTION_COLORS, EMOTION_EMOJIS } from '../../services/emotionAnalysisService';
import { EmotionHistory } from '../../services/databaseService';
import 'react-calendar/dist/Calendar.css';

interface EmotionCalendarProps {
  data: EmotionHistory[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  className?: string;
}

interface CalendarTileProps {
  date: Date;
  view: string;
  emotionData?: EmotionHistory;
}

const EmotionCalendar: React.FC<EmotionCalendarProps> = ({
  data,
  onDateSelect,
  selectedDate,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [view, setView] = useState<'month' | 'year'>('month');

  // 날짜별 감정 데이터 매핑
  const getEmotionForDate = (date: Date): EmotionHistory | undefined => {
    const dateString = date.toDateString();
    return data.find(emotion => 
      new Date(emotion.date).toDateString() === dateString
    );
  };

  // 감정 강도에 따른 색상 투명도 계산
  const getEmotionIntensity = (emotion: EmotionHistory): number => {
    const maxScore = Math.max(...Object.values(emotion.emotions));
    return Math.min(maxScore / 3, 1); // 최대 3점 기준으로 정규화
  };

  // 캘린더 타일 콘텐츠
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const emotionData = getEmotionForDate(date);
    if (!emotionData) return null;

    const intensity = getEmotionIntensity(emotionData);
    const primaryColor = EMOTION_COLORS[emotionData.primaryEmotion];
    const emoji = EMOTION_EMOJIS[emotionData.primaryEmotion];

    return (
      <div className="emotion-tile">
        <div 
          className="emotion-indicator"
          style={{
            backgroundColor: `${primaryColor}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
            border: `2px solid ${primaryColor}`,
          }}
        >
          <span className="emotion-emoji text-xs">{emoji}</span>
        </div>
      </div>
    );
  };

  // 타일 클래스명
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';
    
    const emotionData = getEmotionForDate(date);
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    const isToday = date.toDateString() === new Date().toDateString();
    
    let className = 'calendar-tile';
    
    if (emotionData) {
      className += ' has-emotion';
      className += ` emotion-${emotionData.primaryEmotion}`;
    }
    
    if (isSelected) {
      className += ' selected';
    }
    
    if (isToday) {
      className += ' today';
    }
    
    return className;
  };

  // 날짜 클릭 핸들러
  const handleDateChange = (value: Date | Date[]) => {
    const selectedDate = Array.isArray(value) ? value[0] : value;
    setCurrentDate(selectedDate);
    onDateSelect?.(selectedDate);
  };

  // 감정 통계 계산
  const getMonthlyStats = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyData = data.filter(emotion => {
      const emotionDate = new Date(emotion.date);
      return emotionDate.getMonth() === currentMonth && 
             emotionDate.getFullYear() === currentYear;
    });

    const emotionCounts: Record<EmotionType, number> = {
      happy: 0, sad: 0, angry: 0, neutral: 0, excited: 0,
      calm: 0, anxious: 0, proud: 0, disappointed: 0, grateful: 0
    };

    monthlyData.forEach(emotion => {
      emotionCounts[emotion.primaryEmotion]++;
    });

    const totalDays = monthlyData.length;
    const averageScore = totalDays > 0 
      ? monthlyData.reduce((sum, emotion) => sum + emotion.overallScore, 0) / totalDays 
      : 0;

    return {
      totalDays,
      averageScore,
      emotionCounts,
      mostFrequentEmotion: Object.entries(emotionCounts).reduce((a, b) => 
        emotionCounts[a[0] as EmotionType] > emotionCounts[b[0] as EmotionType] ? a : b
      )[0] as EmotionType
    };
  };

  const monthlyStats = getMonthlyStats();

  return (
    <div className={`bg-white rounded-lg shadow-soft border border-gray-200 ${className}`}>
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">감정 캘린더</h3>
              <p className="text-sm text-gray-500">
                {currentDate.toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
          </div>
          
          {/* 월간 통계 */}
          <div className="hidden sm:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {monthlyStats.totalDays}
              </div>
              <div className="text-xs text-gray-500">일기</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {monthlyStats.averageScore.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">평균 점수</div>
            </div>
            
            {monthlyStats.totalDays > 0 && (
              <div className="text-center">
                <div className="text-2xl">
                  {EMOTION_EMOJIS[monthlyStats.mostFrequentEmotion]}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {monthlyStats.mostFrequentEmotion}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 캘린더 */}
      <div className="p-6">
        <div className="emotion-calendar-wrapper">
          <Calendar
            value={currentDate}
            onChange={handleDateChange}
            tileContent={tileContent}
            tileClassName={tileClassName}
            view={view}
            locale="ko-KR"
            formatDay={(locale, date) => date.getDate().toString()}
            formatMonthYear={(locale, date) => 
              date.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long' 
              })
            }
            prev2Label={null}
            next2Label={null}
            prevLabel={<ChevronLeft size={20} />}
            nextLabel={<ChevronRight size={20} />}
            navigationLabel={({ date, label, locale, view }) => (
              <button
                className="navigation-label"
                onClick={() => setView(view === 'month' ? 'year' : 'month')}
              >
                {label}
              </button>
            )}
            minDetail="month"
            maxDetail="month"
            showNeighboringMonth={false}
          />
        </div>

        {/* 범례 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">감정 범례</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(EMOTION_EMOJIS).slice(0, 5).map(([emotion, emoji]) => (
              <div key={emotion} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full border-2"
                  style={{ 
                    backgroundColor: `${EMOTION_COLORS[emotion as EmotionType]}40`,
                    borderColor: EMOTION_COLORS[emotion as EmotionType]
                  }}
                />
                <span className="text-xs text-gray-600">
                  {emoji} {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>투명도가 높을수록 강한 감정</span>
              <span>오늘은 굵은 테두리로 표시</span>
            </div>
          </div>
        </div>

        {/* 선택된 날짜 정보 */}
        {selectedDate && (() => {
          const selectedEmotion = getEmotionForDate(selectedDate);
          if (!selectedEmotion) return null;
          
          return (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-900">
                  {selectedDate.toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </h4>
                <span className="text-2xl">
                  {EMOTION_EMOJIS[selectedEmotion.primaryEmotion]}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-700 capitalize">
                    주요 감정: {selectedEmotion.primaryEmotion}
                  </div>
                  <div className="text-sm text-blue-600">
                    전체 점수: {selectedEmotion.overallScore > 0 ? '+' : ''}{selectedEmotion.overallScore.toFixed(1)}
                  </div>
                </div>
                
                <div className="text-xs text-blue-500">
                  신뢰도: {Math.round(selectedEmotion.confidence * 100)}%
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <style jsx>{`
        .emotion-calendar-wrapper {
          --calendar-bg: #ffffff;
          --calendar-border: #e5e7eb;
          --calendar-text: #374151;
          --calendar-text-muted: #9ca3af;
          --calendar-highlight: #3b82f6;
        }

        .emotion-calendar-wrapper :global(.react-calendar) {
          width: 100%;
          background: var(--calendar-bg);
          border: none;
          font-family: inherit;
          line-height: 1.125em;
        }

        .emotion-calendar-wrapper :global(.react-calendar__navigation) {
          display: flex;
          height: 44px;
          margin-bottom: 1em;
        }

        .emotion-calendar-wrapper :global(.react-calendar__navigation button) {
          min-width: 44px;
          background: transparent;
          border: none;
          color: var(--calendar-text);
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .emotion-calendar-wrapper :global(.react-calendar__navigation button:hover) {
          background-color: #f3f4f6;
        }

        .emotion-calendar-wrapper :global(.react-calendar__navigation__label) {
          flex-grow: 1;
          text-align: center;
        }

        .emotion-calendar-wrapper :global(.react-calendar__month-view__weekdays) {
          text-align: center;
          text-transform: uppercase;
          font-weight: 500;
          font-size: 0.75em;
          color: var(--calendar-text-muted);
          margin-bottom: 8px;
        }

        .emotion-calendar-wrapper :global(.react-calendar__month-view__weekdays__weekday) {
          padding: 8px;
        }

        .emotion-calendar-wrapper :global(.react-calendar__month-view__days__day) {
          position: relative;
          min-height: 40px;
          background: transparent;
          border: none;
          color: var(--calendar-text);
          font-size: 14px;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .emotion-calendar-wrapper :global(.react-calendar__month-view__days__day:hover) {
          background-color: #f3f4f6;
        }

        .emotion-calendar-wrapper :global(.react-calendar__month-view__days__day--neighboringMonth) {
          color: var(--calendar-text-muted);
        }

        .emotion-calendar-wrapper :global(.react-calendar__tile.today) {
          background: #dbeafe;
          border: 2px solid var(--calendar-highlight);
          font-weight: 600;
        }

        .emotion-calendar-wrapper :global(.react-calendar__tile.selected) {
          background: var(--calendar-highlight);
          color: white;
        }

        .emotion-tile {
          position: absolute;
          bottom: 2px;
          right: 2px;
        }

        .emotion-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .emotion-emoji {
          font-size: 8px;
          line-height: 1;
        }

        .navigation-label {
          background: none;
          border: none;
          font: inherit;
          color: inherit;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .navigation-label:hover {
          background-color: #f3f4f6;
        }

        @media (max-width: 640px) {
          .emotion-calendar-wrapper :global(.react-calendar__month-view__days__day) {
            min-height: 36px;
            font-size: 12px;
          }

          .emotion-indicator {
            width: 10px;
            height: 10px;
          }

          .emotion-emoji {
            font-size: 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default EmotionCalendar;