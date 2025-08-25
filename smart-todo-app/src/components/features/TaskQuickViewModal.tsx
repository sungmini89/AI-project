import { X, Calendar, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Button, Card } from "@/components/ui";
import { cn } from "@/utils";
import type { Task } from "@/types";

interface TaskQuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export default function TaskQuickViewModal({
  isOpen,
  onClose,
  title,
  tasks,
  onTaskClick,
}: TaskQuickViewModalProps) {
  if (!isOpen) return null;

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "done":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "in-progress":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      case "high":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700";
    }
  };

  const getPriorityText = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "긴급";
      case "high":
        return "높음";
      case "medium":
        return "보통";
      case "low":
        return "낮음";
      default:
        return "보통";
    }
  };

  const getStatusText = (status: Task["status"]) => {
    switch (status) {
      case "done":
        return "완료";
      case "in-progress":
        return "진행중";
      case "todo":
        return "할일";
      default:
        return "할일";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800">
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Task List */}
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>해당하는 일정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className={cn(
                    "p-3 rounded-lg border border-gray-200 dark:border-gray-600",
                    "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                    onTaskClick && "cursor-pointer"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getStatusColor(task.status)
                          )}
                        >
                          {getStatusText(task.status)}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getPriorityColor(task.priority)
                          )}
                        >
                          {getPriorityText(task.priority)}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Due Date and Time */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {format(task.dueDate, "MM월 dd일 (EEE) HH:mm", {
                            locale: ko,
                          })}
                        </span>
                      </div>
                    )}
                    {task.estimatedTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimatedTime}분</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {task.tags.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                          +{task.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              총 {tasks.length}개의 일정
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
