import { useMemo, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import type { View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { useTaskStore } from "@/stores";
import { cn } from "@/utils";
import TaskDetailModal from "./TaskDetailModal";
import type { Task } from "@/types";

// CalendarEvent 타입을 로컬에 정의
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: Task;
}

const locales = {
  ko: ko,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const messages = {
  allDay: "종일",
  previous: "이전",
  next: "다음",
  today: "오늘",
  month: "월별",
  week: "주별",
  day: "일별",
  agenda: "일정 목록",
  date: "날짜",
  time: "시간",
  event: "일정",
  noEventsInRange: "해당 기간에 일정이 없습니다.",
  showMore: (total: number) => `+${total}개 더보기`,
  work_week: "업무일",
  yesterday: "어제",
  tomorrow: "내일",
};

interface TaskCalendarProps {
  className?: string;
}

export default function TaskCalendar({ className }: TaskCalendarProps) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { tasks } = useTaskStore();

  const events = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];

    tasks.forEach((task) => {
      if (task.dueDate) {
        // dueDate가 Date 객체가 아닌 경우 Date 객체로 변환
        let dueDateObj: Date;
        if (task.dueDate instanceof Date) {
          dueDateObj = new Date(task.dueDate);
        } else if (
          typeof task.dueDate === "string" ||
          typeof task.dueDate === "number"
        ) {
          dueDateObj = new Date(task.dueDate);
        } else {
          return; // 유효하지 않은 날짜는 건너뛰기
        }

        // 유효한 날짜인지 확인
        if (isNaN(dueDateObj.getTime())) {
          console.warn("Invalid date for task:", task.title, task.dueDate);
          return;
        }

        // 시작 시간과 종료 시간을 같은 날로 설정
        const startDate = new Date(dueDateObj);
        const endDate = new Date(dueDateObj);

        // 만약 시간이 설정되지 않았다면 기본 시간 설정
        if (startDate.getHours() === 0 && startDate.getMinutes() === 0) {
          startDate.setHours(9, 0, 0, 0); // 오전 9시로 설정
          endDate.setHours(9, 0, 0, 0);
        }

        if (task.estimatedTime && task.estimatedTime > 0) {
          endDate.setMinutes(endDate.getMinutes() + task.estimatedTime);
        } else {
          // 기본적으로 1시간 이벤트로 설정
          endDate.setHours(endDate.getHours() + 1);
        }

        // 종료 시간이 다음 날로 넘어가지 않도록 보정
        if (endDate.getDate() !== startDate.getDate()) {
          endDate.setDate(startDate.getDate());
          endDate.setHours(23, 59, 59, 999);
        }

        // 이벤트 객체 생성 - allDay로 설정하여 더 안정적인 표시
        const calendarEvent: CalendarEvent = {
          id: task.id,
          title: task.title,
          start: startDate,
          end: endDate,
          allDay: true, // 종일 이벤트로 변경
          resource: task,
        };

        calendarEvents.push(calendarEvent);
      }
    });

    return calendarEvents;
  }, [tasks]);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const task = event.resource as Task;
    let backgroundColor = "#3174ad";
    let borderColor = "#3174ad";

    // 과거 날짜인 경우 투명도 조정
    const today = new Date();
    const eventDate = new Date(event.start);
    const isOverdue =
      eventDate < today && !isToday(eventDate) && task.status !== "done";

    if (task.status === "done") {
      backgroundColor = "#10b981";
      borderColor = "#10b981";
    } else if (task.status === "in-progress") {
      backgroundColor = "#3b82f6";
      borderColor = "#3b82f6";
    } else if (task.priority === "urgent") {
      backgroundColor = "#ef4444";
      borderColor = "#ef4444";
    } else if (task.priority === "high") {
      backgroundColor = "#f97316";
      borderColor = "#f97316";
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: "white",
        border: "none",
        borderRadius: "4px",
        fontSize: "12px",
        padding: "2px 6px",
        opacity: isOverdue ? 0.7 : 1,
      },
    };
  }, []);

  // 오늘 날짜 확인 헬퍼 함수
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const dayPropGetter = useCallback(
    (date: Date) => {
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();

      const hasTasks = tasks.some(
        (task) =>
          task.dueDate && task.dueDate.toDateString() === date.toDateString()
      );

      return {
        className: cn(
          isToday && "bg-blue-50 dark:bg-blue-900/20",
          hasTasks && "font-semibold"
        ),
      };
    },
    [tasks]
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    const task = event.resource as Task;
    if (task) {
      setSelectedTask(task);
      setIsModalOpen(true);
    }
  }, []);

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      console.log("Selected slot:", { start, end });
    },
    []
  );

  const CustomEvent = ({ event }: { event: CalendarEvent }) => {
    const task = event.resource as Task;
    return (
      <div className="w-full h-full flex items-center">
        <div className="flex items-center space-x-1 truncate">
          <div
            className={cn(
              "w-2 h-2 rounded-full flex-shrink-0",
              task.status === "done"
                ? "bg-green-200"
                : task.status === "in-progress"
                ? "bg-blue-200"
                : "bg-gray-200"
            )}
          />
          <span className="text-xs font-medium truncate">{event.title}</span>
        </div>
      </div>
    );
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className={cn("h-full", className)}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        popup={false}
        showMultiDayTimes={false}
        messages={messages}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        components={{
          event: CustomEvent,
        }}
        style={{ height: 600 }}
        culture="ko"
        formats={{
          eventTimeRangeFormat: () => "",
        }}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
