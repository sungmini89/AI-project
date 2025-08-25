import { useState } from "react";
import {
  Clock,
  Calendar,
  Tag,
  MoreHorizontal,
  Circle,
  PlayCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import TaskDetailModal from "./TaskDetailModal";
import type { Task } from "../../types";
import { useTaskStore } from "@/stores";
import { formatDate, getRelativeTimeString, cn } from "@/utils";
import { PRIORITY_COLORS, CATEGORY_COLORS } from "@/constants";

/**
 * TaskCard 컴포넌트의 속성 정의
 * @interface TaskCardProps
 */
interface TaskCardProps {
  /** 표시할 할일 데이터 */
  task: Task;
  /** 추가적인 CSS 클래스 */
  className?: string;
  /** 컴팩트 뷰 여부 (true: 간단한 레이아웃, false: 상세 레이아웃) */
  compact?: boolean;
}

/**
 * 할일을 카드 형태로 표시하는 컴포넌트
 *
 * @description
 * 개별 할일을 카드 형태로 렌더링합니다. 두 가지 레이아웃을 지원합니다:
 * - compact: 간단한 한 줄 레이아웃
 * - regular: 상세 정보가 포함된 카드 레이아웃
 *
 * 주요 기능:
 * - 상태 토글 (할일 → 진행중 → 완료 → 할일)
 * - 카드 클릭 시 상세 모달 열기
 * - 우선순위, 카테고리, 마감일 표시
 * - 지연된 할일 시각적 강조
 *
 * @param {TaskCardProps} props - 컴포넌트 속성
 * @returns {JSX.Element} 렌더링된 할일 카드
 *
 * @example
 * // 간단한 카드
 * <TaskCard task={myTask} compact={true} />
 *
 * // 상세 카드
 * <TaskCard task={myTask} compact={false} className="custom-style" />
 */
export default function TaskCard({
  task,
  className,
  compact = false,
}: TaskCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toggleTaskStatus } = useTaskStore();

  const isOverdue = (() => {
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

    return dueDateObj < new Date();
  })();

  const isDueToday = (() => {
    if (!task.dueDate) return false;

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

    return formatDate(dueDateObj) === formatDate(new Date());
  })();

  /**
   * 할일 상태를 토글하는 이벤트 핸들러
   * @description 버튼 클릭 시 상태를 순환시킵니다 (할일 → 진행중 → 완료 → 할일)
   * @param {React.MouseEvent} e - 마우스 클릭 이벤트
   */
  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    toggleTaskStatus(task.id);
  };

  /**
   * 카드 클릭 시 상세 모달을 여는 이벤트 핸들러
   * @description 할일의 상세 정보를 편집할 수 있는 모달을 엽니다
   */
  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  /**
   * 상세 모달을 닫는 이벤트 핸들러
   * @description 모달 상태를 false로 변경하여 모달을 닫습니다
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  /**
   * 현재 상태에 맞는 아이콘 컴포넌트를 반환
   * @description 할일 상태에 따라 적절한 Lucide React 아이콘을 선택합니다
   * @returns {LucideIcon} 상태에 맞는 아이콘 컴포넌트
   */
  const getStatusIcon = () => {
    switch (task.status) {
      case "todo":
        return Circle;
      case "in-progress":
        return PlayCircle;
      case "done":
        return CheckCircle;
      default:
        return Circle;
    }
  };

  /**
   * 현재 상태에 맞는 CSS 클래스를 반환
   * @description 상태별 색상과 호버 효과를 정의한 Tailwind CSS 클래스를 반환합니다
   * @returns {string} Tailwind CSS 클래스 문자열
   */
  const getStatusColor = () => {
    switch (task.status) {
      case "todo":
        return "text-gray-400 hover:text-blue-500";
      case "in-progress":
        return "text-blue-500 hover:text-green-500";
      case "done":
        return "text-green-500 hover:text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  /**
   * 현재 상태에 맞는 툴팁 메시지를 반환
   * @description 사용자가 버튼을 클릭했을 때 어떤 일이 일어날지 설명하는 메시지
   * @returns {string} 툴팁에 표시될 메시지
   */
  const getStatusTooltip = () => {
    switch (task.status) {
      case "todo":
        return "클릭하면 진행중으로 변경";
      case "in-progress":
        return "클릭하면 완료로 변경";
      case "done":
        return "클릭하면 할일로 되돌리기";
      default:
        return "";
    }
  };

  /**
   * 현재 상태에 맞는 한글 레이블을 반환
   * @description 상태를 사용자가 이해하기 쉬운 한글 텍스트로 변환합니다
   * @returns {string} 상태의 한글 레이블
   */
  const getStatusLabel = () => {
    switch (task.status) {
      case "todo":
        return "할일";
      case "in-progress":
        return "진행중";
      case "done":
        return "완료";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    return PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
  };

  const getCategoryColor = (category: Task["category"]) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS["기타"];
  };

  if (compact) {
    return (
      <>
        <div
          className={cn(
            "flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow cursor-pointer",
            isOverdue &&
              "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
            className
          )}
          onClick={handleCardClick}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <button
              onClick={handleStatusToggle}
              className={cn(
                "flex-shrink-0 transition-all duration-200 group relative",
                getStatusColor()
              )}
              title={getStatusTooltip()}
            >
              {(() => {
                const StatusIcon = getStatusIcon();
                return <StatusIcon className="w-5 h-5" />;
              })()}

              {/* 상태 레이블 (호버 시 표시) */}
              <span className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {getStatusLabel()} → {getStatusTooltip()}
              </span>
            </button>

            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  task.status === "done"
                    ? "line-through text-gray-500"
                    : "text-gray-900 dark:text-white"
                )}
              >
                {task.title}
              </p>

              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant="outline"
                  className={cn("text-xs", getCategoryColor(task.category))}
                >
                  {task.category}
                </Badge>

                {task.dueDate && (
                  <div
                    className={cn(
                      "flex items-center text-xs",
                      isOverdue
                        ? "text-red-600"
                        : isDueToday
                        ? "text-orange-600"
                        : "text-gray-500"
                    )}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    {getRelativeTimeString(task.dueDate)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn("text-xs ml-2", getPriorityColor(task.priority))}
          >
            {task.priority}
          </Badge>
        </div>

        <TaskDetailModal
          task={task}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </>
    );
  }

  return (
    <>
      <Card
        className={cn(
          "hover:shadow-md transition-shadow cursor-pointer",
          isOverdue &&
            "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
          className
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <button
                onClick={handleStatusToggle}
                className={cn(
                  "flex-shrink-0 mt-0.5 transition-all duration-200 group relative",
                  getStatusColor()
                )}
                title={getStatusTooltip()}
              >
                {(() => {
                  const StatusIcon = getStatusIcon();
                  return <StatusIcon className="w-6 h-6" />;
                })()}

                {/* 상태 레이블 (호버 시 표시) */}
                <span className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {getStatusLabel()} → {getStatusTooltip()}
                </span>
              </button>

              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-medium text-gray-900 dark:text-white",
                    task.status === "done" && "line-through text-gray-500"
                  )}
                >
                  {task.title}
                </h3>

                {task.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={getCategoryColor(task.category)}
                    >
                      {task.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getPriorityColor(task.priority)}
                    >
                      {task.priority}
                    </Badge>
                  </div>

                  {task.dueDate && (
                    <div
                      className={cn(
                        "flex items-center text-sm",
                        isOverdue
                          ? "text-red-600"
                          : isDueToday
                          ? "text-orange-600"
                          : "text-gray-500"
                      )}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      {getRelativeTimeString(task.dueDate)}
                    </div>
                  )}

                  {task.estimatedTime && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {task.estimatedTime}분
                    </div>
                  )}
                </div>

                {task.tags.length > 0 && (
                  <div className="flex items-center space-x-1 mt-2">
                    <Tag className="w-3 h-3 text-gray-400" />
                    {task.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{task.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <TaskDetailModal
        task={task}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
