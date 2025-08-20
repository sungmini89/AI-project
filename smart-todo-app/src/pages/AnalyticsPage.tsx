import { useMemo } from "react";
import {
  BarChart3,
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useTaskStore, usePomodoroStore } from "@/stores";
import { TASK_CATEGORIES, TASK_PRIORITIES } from "@/constants";
import { formatDuration, isToday, isThisWeek, isThisMonth } from "@/utils";

export default function AnalyticsPage() {
  const { tasks } = useTaskStore();
  const { sessions, getSessionStats } = usePomodoroStore();

  const taskAnalytics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "done").length;
    const inProgress = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;
    const todo = tasks.filter((task) => task.status === "todo").length;

    const overdue = tasks.filter(
      (task) =>
        task.dueDate && task.dueDate < new Date() && task.status !== "done"
    ).length;

    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    const categoryStats = TASK_CATEGORIES.map((category) => ({
      category,
      total: tasks.filter((task) => task.category === category).length,
      completed: tasks.filter(
        (task) => task.category === category && task.status === "done"
      ).length,
    })).filter((stat) => stat.total > 0);

    const priorityStats = TASK_PRIORITIES.map((priority) => ({
      priority,
      total: tasks.filter((task) => task.priority === priority).length,
      completed: tasks.filter(
        (task) => task.priority === priority && task.status === "done"
      ).length,
    })).filter((stat) => stat.total > 0);

    const todayTasks = tasks.filter(
      (task) => task.dueDate && isToday(task.dueDate)
    ).length;

    const thisWeekTasks = tasks.filter(
      (task) => task.dueDate && isThisWeek(task.dueDate)
    ).length;

    const thisMonthTasks = tasks.filter(
      (task) => task.dueDate && isThisMonth(task.dueDate)
    ).length;

    const estimatedTimeStats = tasks
      .filter((task) => task.estimatedTime)
      .reduce(
        (acc, task) => {
          acc.total += task.estimatedTime!;
          if (task.status === "done") {
            acc.completed += task.estimatedTime!;
          }
          return acc;
        },
        { total: 0, completed: 0 }
      );

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      completionRate,
      categoryStats,
      priorityStats,
      todayTasks,
      thisWeekTasks,
      thisMonthTasks,
      estimatedTimeStats,
    };
  }, [tasks]);

  const pomodoroAnalytics = useMemo(() => {
    const stats = getSessionStats();

    const todaySessions = sessions.filter((session) =>
      isToday(session.startTime)
    );

    const thisWeekSessions = sessions.filter((session) =>
      isThisWeek(session.startTime)
    );

    const thisMonthSessions = sessions.filter((session) =>
      isThisMonth(session.startTime)
    );

    const workSessions = sessions.filter(
      (s) => s.type === "work" && s.isCompleted
    );
    const totalWorkTime = workSessions.reduce((sum, s) => sum + s.duration, 0);

    return {
      ...stats,
      todaySessions: todaySessions.length,
      thisWeekSessions: thisWeekSessions.length,
      thisMonthSessions: thisMonthSessions.length,
      totalWorkTime,
      averageSessionsPerDay: thisWeekSessions.length / 7,
    };
  }, [sessions, getSessionStats]);

  const productivityScore = useMemo(() => {
    let score = 0;

    if (taskAnalytics.completionRate >= 80) score += 30;
    else if (taskAnalytics.completionRate >= 60) score += 20;
    else if (taskAnalytics.completionRate >= 40) score += 10;

    if (taskAnalytics.overdue === 0) score += 20;
    else if (taskAnalytics.overdue <= 2) score += 10;

    if (pomodoroAnalytics.todaySessions >= 4) score += 25;
    else if (pomodoroAnalytics.todaySessions >= 2) score += 15;
    else if (pomodoroAnalytics.todaySessions >= 1) score += 10;

    if (taskAnalytics.inProgress > 0) score += 15;

    if (taskAnalytics.estimatedTimeStats.total > 0) score += 10;

    return Math.min(score, 100);
  }, [taskAnalytics, pomodoroAnalytics]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          분석 및 통계
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          작업 효율성과 진행 상황을 확인하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">생산성 점수</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productivityScore}점</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {productivityScore >= 80
                ? "매우 높음"
                : productivityScore >= 60
                ? "높음"
                : productivityScore >= 40
                ? "보통"
                : "낮음"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료율</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taskAnalytics.completionRate}%
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {taskAnalytics.completed}/{taskAnalytics.total} 완료
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              오늘 집중 시간
            </CardTitle>
            <Timer className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pomodoroAnalytics.todaySessions}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              세션 완료
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">지연된 작업</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {taskAnalytics.overdue}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              처리 필요
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              작업 상태 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  완료됨
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${taskAnalytics.completionRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12">
                    {taskAnalytics.completed}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  진행중
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          taskAnalytics.total > 0
                            ? (taskAnalytics.inProgress / taskAnalytics.total) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12">
                    {taskAnalytics.inProgress}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  대기중
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{
                        width: `${
                          taskAnalytics.total > 0
                            ? (taskAnalytics.todo / taskAnalytics.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12">
                    {taskAnalytics.todo}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              기간별 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  오늘
                </span>
                <span className="font-semibold">
                  {taskAnalytics.todayTasks}개
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  이번 주
                </span>
                <span className="font-semibold">
                  {taskAnalytics.thisWeekTasks}개
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  이번 달
                </span>
                <span className="font-semibold">
                  {taskAnalytics.thisMonthTasks}개
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  포모도로 통계
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      총 작업 시간
                    </span>
                    <span className="text-sm font-medium">
                      {formatDuration(pomodoroAnalytics.totalWorkTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      이번 주 세션
                    </span>
                    <span className="text-sm font-medium">
                      {pomodoroAnalytics.thisWeekSessions}회
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      일평균 세션
                    </span>
                    <span className="text-sm font-medium">
                      {Math.round(
                        pomodoroAnalytics.averageSessionsPerDay * 10
                      ) / 10}
                      회
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {taskAnalytics.categoryStats.map((stat) => (
                <div key={stat.category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {stat.category}
                    </span>
                    <span className="font-medium">
                      {stat.completed}/{stat.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(stat.completed / stat.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}

              {taskAnalytics.categoryStats.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  카테고리 데이터가 없습니다.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>우선순위별 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {taskAnalytics.priorityStats.map((stat) => (
                <div key={stat.priority} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {stat.priority}
                    </span>
                    <span className="font-medium">
                      {stat.completed}/{stat.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        stat.priority === "urgent"
                          ? "bg-red-500"
                          : stat.priority === "high"
                          ? "bg-orange-500"
                          : stat.priority === "medium"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                      style={{
                        width: `${(stat.completed / stat.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}

              {taskAnalytics.priorityStats.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  우선순위 데이터가 없습니다.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {taskAnalytics.estimatedTimeStats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              시간 관리 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatDuration(taskAnalytics.estimatedTimeStats.total)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  예상 총 시간
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatDuration(taskAnalytics.estimatedTimeStats.completed)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  완료된 시간
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(
                    (taskAnalytics.estimatedTimeStats.completed /
                      taskAnalytics.estimatedTimeStats.total) *
                      100
                  )}
                  %
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  시간 완료율
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
