import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  TaskQuickAdd,
  TaskCard,
  TaskQuickViewModal,
} from "@/components/features";
import { useTaskStore, usePomodoroStore } from "@/stores";
import type { Task } from "@/types";

export default function Dashboard() {
  const { tasks, getTodayTasks, getOverdueTasks, getUpcomingTasks } =
    useTaskStore();
  const { getSessionStats } = usePomodoroStore();

  const [quickViewModal, setQuickViewModal] = useState<{
    isOpen: boolean;
    title: string;
    tasks: Task[];
  }>({
    isOpen: false,
    title: "",
    tasks: [],
  });

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "done").length;
    const inProgress = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;
    const overdue = getOverdueTasks().length;
    const today = getTodayTasks().length;
    const upcoming = getUpcomingTasks().length;

    return {
      total,
      completed,
      inProgress,
      overdue,
      today,
      upcoming,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks, getTodayTasks, getOverdueTasks, getUpcomingTasks]);

  const pomodoroStats = getSessionStats();

  const recentTasks = useMemo(() => {
    return tasks
      .filter((task) => task.status !== "done")
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          const aDate =
            a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
          const bDate =
            b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
          return aDate.getTime() - bDate.getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      })
      .slice(0, 5);
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    // taskStore의 getUpcomingTasks 함수를 사용
    return getUpcomingTasks().slice(0, 5);
  }, [getUpcomingTasks]);

  const handleQuickView = (
    type: "total" | "inProgress" | "today" | "overdue"
  ) => {
    let title = "";
    let taskList: Task[] = [];

    switch (type) {
      case "total":
        title = "전체 할일";
        taskList = tasks;
        break;
      case "inProgress":
        title = "진행중인 할일";
        taskList = tasks.filter((task) => task.status === "in-progress");
        break;
      case "today":
        title = "오늘 할일";
        taskList = getTodayTasks();
        break;
      case "overdue":
        title = "지연된 할일";
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
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          대시보드
        </h1>
        <p className="text-lg text-gray-900 dark:text-white max-w-2xl mx-auto">
          오늘의 할일을 확인하고 새로운 작업을 추가하세요
        </p>
      </div>

      <TaskQuickAdd />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleQuickView("total")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 할일</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </div>
            <p className="text-xs text-gray-900 dark:text-white">
              완료율 {stats.completionRate}%
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleQuickView("inProgress")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행중</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.inProgress}
            </div>
            <p className="text-xs text-gray-900 dark:text-white">활성 작업</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleQuickView("today")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 할일</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.today}
            </div>
            <p className="text-xs text-gray-900 dark:text-white">예정된 작업</p>
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
              {stats.overdue}
            </div>
            <p className="text-xs text-gray-900 dark:text-white">처리 필요</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="mr-2 h-5 w-5" />
              오늘의 포모도로
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  완료된 세션
                </span>
                <span className="font-semibold">
                  {pomodoroStats.todayCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  총 집중 시간
                </span>
                <span className="font-semibold">
                  {Math.floor(pomodoroStats.totalTime / 60)}시간{" "}
                  {pomodoroStats.totalTime % 60}분
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  평균 세션
                </span>
                <span className="font-semibold">
                  {Math.round(pomodoroStats.averageTime)}분
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              주간 동향
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  이번 주 완료
                </span>
                <span className="font-semibold">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  다가오는 작업
                </span>
                <span className="font-semibold">{stats.upcoming}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  생산성 점수
                </span>
                <span className="font-semibold text-green-600">
                  {stats.completionRate > 80
                    ? "높음"
                    : stats.completionRate > 60
                    ? "보통"
                    : "낮음"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 할일</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <TaskCard key={task.id} task={task} compact />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                할일이 없습니다. 새로운 작업을 추가해보세요!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>다가오는 일정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <TaskCard key={task.id} task={task} compact />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                예정된 일정이 없습니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <TaskQuickViewModal
        isOpen={quickViewModal.isOpen}
        onClose={handleCloseQuickView}
        title={quickViewModal.title}
        tasks={quickViewModal.tasks}
        onTaskClick={() => {}} // 할일 클릭 시 아무것도 하지 않음 (이미 상세 정보가 대시보드에 표시됨)
      />
    </div>
  );
}
