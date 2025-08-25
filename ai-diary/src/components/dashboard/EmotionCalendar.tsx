import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import type { EmotionType } from "../../services/emotionAnalysisService";
import type { EmotionHistory } from "../../services/databaseService";
import { databaseService } from "../../services/databaseService";
import { useApp } from "../../contexts/AppContext";
import "react-calendar/dist/Calendar.css";

const EmotionCalendar: React.FC = () => {
  const [emotionData, setEmotionData] = useState<EmotionHistory[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { language, isDark } = useApp();

  useEffect(() => {
    loadEmotionData();
  }, []);

  const loadEmotionData = async () => {
    try {
      const data = await databaseService.getEmotionHistory();
      setEmotionData(data);
    } catch (error) {
      console.error("감정 데이터 로드 실패:", error);
    }
  };

  const handleDateChange = (
    value: any,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const getTileContent = ({ date }: { date: Date }) => {
    // 날짜를 로컬 시간대로 비교 (시간대 문제 해결)
    const dateStr = date.toLocaleDateString("en-CA"); // YYYY-MM-DD 형식
    const emotionEntry = emotionData.find((entry) => {
      const entryDate = new Date(entry.date);
      const entryDateStr = entryDate.toLocaleDateString("en-CA");
      return entryDateStr === dateStr;
    });

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
    // 날짜를 로컬 시간대로 비교 (시간대 문제 해결)
    const dateStr = date.toLocaleDateString("en-CA"); // YYYY-MM-DD 형식
    const emotionEntry = emotionData.find((entry) => {
      const entryDate = new Date(entry.date);
      const entryDateStr = entryDate.toLocaleDateString("en-CA");
      return entryDateStr === dateStr;
    });

    if (emotionEntry) {
      return `emotion-tile emotion-${emotionEntry.emotion.toLowerCase()}`;
    }
    return "";
  };

  const getEmotionEmoji = (emotion: EmotionType): string => {
    const emojiMap: Record<EmotionType, string> = {
      happy: "😊",
      sad: "😢",
      angry: "😠",
      neutral: "😐",
      excited: "🤩",
      calm: "😌",
      anxious: "😰",
      proud: "😎",
      disappointed: "😞",
      grateful: "🙏",
    };
    return emojiMap[emotion] || "😐";
  };

  const formatDay = (locale: string | undefined, date: Date) => {
    return date.getDate().toString();
  };

  const formatMonthYear = (locale: string | undefined, date: Date) => {
    if (language === "ko") {
      return `${date.getMonth() + 1}월 ${date.getFullYear()}`;
    } else {
      return `${date.toLocaleDateString("en-US", {
        month: "long",
      })} ${date.getFullYear()}`;
    }
  };

  return (
    <div className="calendar-container">
      <style>
        {`
          .emotion-calendar.dark {
            background-color: #1f2937 !important;
            color: #f9fafb !important;
          }
          
          .emotion-calendar.dark .react-calendar__tile {
            color: #f9fafb !important;
          }
          
          .emotion-calendar.dark .react-calendar__tile:enabled:hover {
            background-color: #374151 !important;
          }
          
          .emotion-calendar.dark .react-calendar__tile--active {
            background-color: #3b82f6 !important;
            color: #ffffff !important;
          }
          
          .emotion-calendar.dark .react-calendar__tile--now {
            background-color: #f59e0b !important;
            color: #ffffff !important;
          }
          
          .emotion-calendar.dark .react-calendar__navigation button {
            color: #f9fafb !important;
          }
          
          .emotion-calendar.dark .react-calendar__navigation button:enabled:hover {
            background-color: #374151 !important;
          }
          
          .emotion-calendar.dark .react-calendar__month-view__weekdays {
            color: #d1d5db !important;
          }
          
          .emotion-calendar.dark .react-calendar__tile--disabled {
            color: #6b7280 !important;
          }
          
          .emotion-calendar.light {
            background-color: #ffffff !important;
            color: #111827 !important;
          }
          
          .emotion-calendar.light .react-calendar__tile {
            color: #111827 !important;
          }
          
          .emotion-calendar.light .react-calendar__tile:enabled:hover {
            background-color: #f3f4f6 !important;
          }
          
          .emotion-calendar.light .react-calendar__tile--active {
            background-color: #3b82f6 !important;
            color: #ffffff !important;
          }
          
          .emotion-calendar.light .react-calendar__tile--now {
            background-color: #fef3c7 !important;
            color: #92400e !important;
          }
          
          .emotion-calendar.light .react-calendar__navigation button {
            color: #111827 !important;
          }
          
          .emotion-calendar.light .react-calendar__navigation button:enabled:hover {
            background-color: #f3f4f6 !important;
          }
          
          .emotion-calendar.light .react-calendar__month-view__weekdays {
            color: #6b7280 !important;
          }
          
          .emotion-calendar.light .react-calendar__tile--disabled {
            color: #9ca3af !important;
          }
        `}
      </style>
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        locale={language === "ko" ? "ko-KR" : "en-US"}
        formatDay={formatDay}
        formatMonthYear={formatMonthYear}
        tileContent={getTileContent}
        tileClassName={getTileClassName}
        className={`emotion-calendar ${isDark ? "dark" : "light"}`}
      />
    </div>
  );
};

export default EmotionCalendar;
