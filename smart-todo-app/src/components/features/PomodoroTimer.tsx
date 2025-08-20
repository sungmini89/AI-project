import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Square, Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";
import { usePomodoroStore, useTaskStore } from "@/stores";
import { usePomodoro } from "@/hooks/usePomodoro";
import { cn } from "@/utils";
import type { PomodoroSession } from "../../types";

interface PomodoroTimerProps {
  className?: string;
  taskId?: string;
}

export default function PomodoroTimer({
  className,
  taskId,
}: PomodoroTimerProps) {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] =
    useState<PomodoroSession["type"]>("work");
  const { startSession } = usePomodoroStore();
  const { tasks } = useTaskStore();

  const {
    currentSession,
    isActive,
    timeRemaining,
    settings,
    formatTime,
    getProgress,
    getSessionTypeText,
    pauseSession,
    resumeSession,
    cancelSession,
  } = usePomodoro();

  const selectedTask = taskId ? tasks.find((task) => task.id === taskId) : null;

  const handleStart = () => {
    startSession(selectedType, taskId);
  };

  const handlePause = () => {
    if (isActive) {
      pauseSession();
    } else {
      resumeSession();
    }
  };

  const handleStop = () => {
    cancelSession();
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const progress = getProgress();
  const strokeDasharray = 2 * Math.PI * 120;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * progress) / 100;

  const getTimerColor = () => {
    if (!currentSession) return "text-gray-600";

    switch (currentSession.type) {
      case "work":
        return "text-blue-600";
      case "short-break":
        return "text-green-600";
      case "long-break":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader>
        <CardTitle className="text-center">포모도로 타이머</CardTitle>
        {selectedTask && (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {selectedTask.title}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {!currentSession && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                세션 타입 선택
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={selectedType === "work" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("work")}
                  className="text-xs"
                >
                  작업
                  <br />
                  <span className="text-xs opacity-70">
                    {settings.workTime}분
                  </span>
                </Button>
                <Button
                  variant={
                    selectedType === "short-break" ? "primary" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedType("short-break")}
                  className="text-xs"
                >
                  짧은휴식
                  <br />
                  <span className="text-xs opacity-70">
                    {settings.shortBreak}분
                  </span>
                </Button>
                <Button
                  variant={
                    selectedType === "long-break" ? "primary" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedType("long-break")}
                  className="text-xs"
                >
                  긴휴식
                  <br />
                  <span className="text-xs opacity-70">
                    {settings.longBreak}분
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="relative flex items-center justify-center">
          <svg className="transform -rotate-90 w-64 h-64" viewBox="0 0 256 256">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            {currentSession && (
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={cn(
                  "transition-all duration-1000 ease-in-out",
                  currentSession.type === "work"
                    ? "text-blue-500"
                    : currentSession.type === "short-break"
                    ? "text-green-500"
                    : "text-purple-500"
                )}
                strokeLinecap="round"
              />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={cn("text-4xl font-bold", getTimerColor())}>
              {formatTime(timeRemaining)}
            </div>

            {currentSession && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {getSessionTypeText(currentSession.type)}
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {currentSession ? `${Math.round(progress)}% 완료` : "준비됨"}
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          {!currentSession ? (
            <Button onClick={handleStart} size="lg" className="px-8">
              <Play className="w-5 h-5 mr-2" />
              시작
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePause}
                variant={isActive ? "outline" : "primary"}
                size="lg"
              >
                {isActive ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    일시정지
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    재개
                  </>
                )}
              </Button>

              <Button onClick={handleStop} variant="destructive" size="lg">
                <Square className="w-5 h-5 mr-2" />
                중지
              </Button>
            </>
          )}
        </div>

        {currentSession && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">진행률</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-1000 ease-out",
                  currentSession.type === "work"
                    ? "bg-blue-500"
                    : currentSession.type === "short-break"
                    ? "bg-green-500"
                    : "bg-purple-500"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={handleSettings}>
            <Settings className="w-4 h-4 mr-2" />
            설정
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
