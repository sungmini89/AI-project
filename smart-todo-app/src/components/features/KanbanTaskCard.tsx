import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  Clock,
  Tag,
  GripVertical,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, Badge } from "@/components/ui";
import TaskDetailModal from "./TaskDetailModal";
import type { Task } from "../../types";
import { cn, getRelativeTimeString, isOverdue, isToday } from "@/utils";
import { PRIORITY_COLORS, CATEGORY_COLORS } from "@/constants";

interface KanbanTaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export default function KanbanTaskCard({
  task,
  isDragging,
}: KanbanTaskCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDraggingState, setIsDraggingState] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id,
      data: {
        type: "task",
        task,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskIsOverdue =
    task.dueDate && isOverdue(task.dueDate) && task.status !== "done";
  const isDueToday = task.dueDate && isToday(task.dueDate);

  const getPriorityColor = (priority: Task["priority"]) => {
    return PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
  };

  const getCategoryColor = (category: Task["category"]) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS["기타"];
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // 드래그 중이거나 드래그 핸들러를 클릭한 경우 모달을 열지 않음
    if (isDraggingState || isDragging) {
      return;
    }
    setIsModalOpen(true);
  };

  const handleMouseDown = () => {
    setIsDraggingState(true);
  };

  const handleMouseUp = () => {
    // 약간의 지연을 두고 드래그 상태를 해제
    setTimeout(() => {
      setIsDraggingState(false);
    }, 100);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "cursor-grab active:cursor-grabbing transition-all duration-200",
          isDragging && "opacity-50 rotate-3 scale-105 shadow-lg",
          taskIsOverdue &&
            "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20",
          "hover:shadow-md"
        )}
        onClick={handleCardClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...attributes}
        {...listeners}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <h4
              className={cn(
                "font-medium text-sm line-clamp-2 flex-1",
                task.status === "done"
                  ? "line-through text-gray-500"
                  : "text-gray-900 dark:text-white"
              )}
            >
              {task.title}
            </h4>
            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
          </div>

          {task.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center flex-wrap gap-1 mb-2">
            <Badge
              variant="outline"
              className={cn("text-xs", getCategoryColor(task.category))}
            >
              {task.category}
            </Badge>

            <Badge
              variant="outline"
              className={cn("text-xs", getPriorityColor(task.priority))}
            >
              {task.priority === "urgent" && (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              {task.priority}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              {task.dueDate && (
                <div
                  className={cn(
                    "flex items-center",
                    taskIsOverdue
                      ? "text-red-600 dark:text-red-400"
                      : isDueToday
                      ? "text-orange-600 dark:text-orange-400"
                      : ""
                  )}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{getRelativeTimeString(task.dueDate)}</span>
                </div>
              )}

              {task.estimatedTime && (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{task.estimatedTime}분</span>
                </div>
              )}
            </div>

            {task.tags.length > 0 && (
              <div className="flex items-center">
                <Tag className="w-3 h-3 mr-1" />
                <span>{task.tags.length}</span>
              </div>
            )}
          </div>

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="text-xs text-gray-400">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          )}
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
