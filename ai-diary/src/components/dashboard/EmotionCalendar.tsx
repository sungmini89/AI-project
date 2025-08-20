import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import type { EmotionType } from '../../services/emotionAnalysisService';
import type { EmotionHistory } from '../../services/databaseService';
import { databaseService } from '../../services/databaseService';
import 'react-calendar/dist/Calendar.css';

const EmotionCalendar: React.FC = () => {
  const [emotionData, setEmotionData] = useState<EmotionHistory[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadEmotionData();
  }, []);

  const loadEmotionData = async () => {
    try {
      const data = await databaseService.getEmotionHistory();
      setEmotionData(data);
    } catch (error) {
      console.error('감정 데이터 로드 실패:', error);
    }
  };

  const handleDateChange = (value: any, event: React.MouseEvent<HTMLButtonElement>) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const getTileContent = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split('T')[0];
    const emotionEntry = emotionData.find(entry => 
      new Date(entry.date).toISOString().split('T')[0] === dateStr
    );

    if (emotionEntry) {
      return (
        <div className="emotion-indicator">
          <span className="emotion-emoji">
            {getEmotionEmoji(emotionEntry.emotion)}
          </span>
        </div>
      );
    }
    return null;
  };

  const getTileClassName = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split('T')[0];
    const emotionEntry = emotionData.find(entry => 
      new Date(entry.date).toISOString().split('T')[0] === dateStr
    );

    if (emotionEntry) {
      return `emotion-tile emotion-${emotionEntry.emotion.toLowerCase()}`;
    }
    return '';
  };

  const getEmotionEmoji = (emotion: EmotionType): string => {
    const emojiMap: Record<EmotionType, string> = {
      'happy': '😊',
      'sad': '😢',
      'angry': '😠',
      'neutral': '😐',
      'excited': '🤩',
      'calm': '😌',
      'anxious': '😰',
      'proud': '😎',
      'disappointed': '😞',
      'grateful': '🙏'
    };
    return emojiMap[emotion] || '😐';
  };

  const formatDay = (locale: string | undefined, date: Date) => {
    return date.getDate().toString();
  };

  const formatMonthYear = (locale: string | undefined, date: Date) => {
    return `${date.getMonth() + 1}월 ${date.getFullYear()}`;
  };

  return (
    <div className="calendar-container">
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        locale="ko-KR"
        formatDay={formatDay}
        formatMonthYear={formatMonthYear}
        tileContent={getTileContent}
        tileClassName={getTileClassName}
        className="emotion-calendar"
      />
    </div>
  );
};

export default EmotionCalendar;