import { useMemo, useState, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  TaskCalendar,
  TaskQuickAdd,
  TaskQuickViewModal,
} from "@/components/features";
import { useTaskStore } from "@/stores";
import { formatDate, isToday, isTomorrow } from "@/utils";
import { startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import type { Task } from "@/types";

export default function CalendarPage() {
  const { tasks, getTodayTasks, getOverdueTasks, getUpcomingTasks } =
    useTaskStore();

  const [quickViewModal, setQuickViewModal] = useState<{
    isOpen: boolean;
    title: string;
    tasks: Task[];
  }>({
    isOpen: false,
    title: "",
    tasks: [],
  });

  const calendarStats = useMemo(() => {
    const today = getTodayTasks();
    const overdue = getOverdueTasks();
    const upcoming = tasks.filter((task) => {
      if (!task.dueDate || task.status === "done") return false;

      // dueDate가 Date 객체가 아닌 경우 Date 객체로 변환
      let dueDateObj: Date;
      if (task.dueDate instanceof Date) {
        dueDateObj = task.dueDate;
      } else if (
        typeof task.dueDate === "string" ||
        typeof task.dueDate === "number"
      ) {
        dueDateObj = new Date(task.dueDate);
      } else {
        return false;
      }

      // 유효한 날짜인지 확인
      if (isNaN(dueDateObj.getTime())) {
        return false;
      }

      const now = new Date();
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      return dueDateObj > now && dueDateObj <= weekFromNow;
    });

    // 이번주 할일 계산
    const todayDate = new Date();
    const startOfWeekDate = startOfWeek(todayDate, { locale: ko });
    const endOfWeekDate = new Date(startOfWeekDate);
    endOfWeekDate.setDate(startOfWeekDate.getDate() + 6);
    endOfWeekDate.setHours(23, 59, 59, 999);

    const thisWeekTasks = tasks.filter((task) => {
      if (!task.dueDate || task.status === "done") return false;

      const dueDateObj =
        task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      if (isNaN(dueDateObj.getTime())) return false;

      return dueDateObj >= startOfWeekDate && dueDateObj <= endOfWeekDate;
    });

    return {
      today: today.length,
      overdue: overdue.length,
      upcoming: upcoming.length,
      thisWeek: thisWeekTasks.length,
    };
  }, [tasks, getTodayTasks, getOverdueTasks]);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (!task.dueDate || task.status === "done") return false;

        // dueDate가 Date 객체가 아닌 경우 Date 객체로 변환
        let dueDateObj: Date;
        if (task.dueDate instanceof Date) {
          dueDateObj = task.dueDate;
        } else if (
          typeof task.dueDate === "string" ||
          typeof task.dueDate === "number"
        ) {
          dueDateObj = new Date(task.dueDate);
        } else {
          return false;
        }

        // 유효한 날짜인지 확인
        if (isNaN(dueDateObj.getTime())) {
          return false;
        }

        return dueDateObj >= new Date();
      })
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          const aDate =
            a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
          const bDate =
            b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
          return aDate.getTime() - bDate.getTime();
        }
        return 0;
      })
      .slice(0, 5);
  }, [tasks]);

  const getThisWeekTasks = useCallback(() => {
    const today = new Date();
    const startOfWeekDate = startOfWeek(today, { locale: ko });
    const endOfWeekDate = new Date(startOfWeekDate);
    endOfWeekDate.setDate(startOfWeekDate.getDate() + 6);
    endOfWeekDate.setHours(23, 59, 59, 999);

    return tasks.filter((task) => {
      if (!task.dueDate || task.status === "done") return false;

      const dueDateObj =
        task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      if (isNaN(dueDateObj.getTime())) return false;

      return dueDateObj >= startOfWeekDate && dueDateObj <= endOfWeekDate;
    });
  }, [tasks]);

  const handleQuickView = (
    type: "today" | "thisWeek" | "upcoming" | "overdue"
  ) => {
    let title = "";
    let taskList: Task[] = [];

    switch (type) {
      case "today":
        title = "오늘 할일";
        taskList = getTodayTasks();
        break;
      case "thisWeek":
        title = "이번주 일정";
        taskList = getThisWeekTasks();
        break;
      case "upcoming":
        title = "다가오는 일정";
        taskList = getUpcomingTasks();
        break;
      case "overdue":
        title = "지연된 일정";
        taskList = getOverdueTasks();
        break;
    }

    setQuickViewModal({
      isOpen: true,
      title,
      tasks: taskList,
    });
  };

  const handleCloseQuickView = () => {
    setQuickViewModal({ isOpen: false, title: "", tasks: [] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            캘린더
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            일정을 캘린더에서 확인하고 관리하세요
          </p>
        </div>
      </div>

      <TaskQuickAdd />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleQuickView("today")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 할일</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calendarStats.today}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              예정된 작업
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleQuickView("thisWeek")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 주</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calendarStats.thisWeek}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">총 일정</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleQuickView("upcoming")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">다가오는 일정</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calendarStats.upcoming}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">7일 내</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleQuickView("overdue")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">지연됨</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {calendarStats.overdue}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              처리 필요
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>캘린더 뷰</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskCalendar />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>다가오는 일정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div
                      className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                        task.priority === "urgent"
                          ? "bg-red-500"
                          : task.priority === "high"
                          ? "bg-orange-500"
                          : task.priority === "medium"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {task.dueDate &&
                            (isToday(task.dueDate)
                              ? "오늘"
                              : isTomorrow(task.dueDate)
                              ? "내일"
                              : formatDate(task.dueDate))}
                        </span>
                        {task.estimatedTime && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            • {task.estimatedTime}분
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                        {task.category}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  예정된 일정이 없습니다.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>캘린더 범례</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  완료됨
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  진행중
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  긴급
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  높음
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  일반
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <TaskQuickViewModal
        isOpen={quickViewModal.isOpen}
        onClose={handleCloseQuickView}
        title={quickViewModal.title}
        tasks={quickViewModal.tasks}
        onTaskClick={() => {}} // 할일 클릭 시 아무것도 하지 않음 (이미 상세 정보가 오른쪽에 표시됨)
      />
    </div>
  );
}
