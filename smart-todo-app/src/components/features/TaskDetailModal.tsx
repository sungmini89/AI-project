import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  Trash2,
  Edit2,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Button, Input, Card } from "@/components/ui";
import { useTaskStore } from "@/stores";
import { useTranslation } from "@/hooks";
import { cn } from "@/utils";
import type { Task, TaskStatus, TaskPriority, TaskCategory } from "@/types";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
}: TaskDetailModalProps) {
  const { t } = useTranslation();
  const { updateTask, deleteTask } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    dueDate: string;
    estimatedTime: number;
    priority: TaskPriority;
    category: TaskCategory;
    status: TaskStatus;
  }>({
    title: "",
    description: "",
    dueDate: "",
    estimatedTime: 0,
    priority: "medium",
    category: "기타",
    status: "todo",
  });

  useEffect(() => {
    if (task) {
      setEditForm({
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate ? format(task.dueDate, "yyyy-MM-dd'T'HH:mm") : "",
        estimatedTime: task.estimatedTime || 0,
        priority: task.priority,
        category: task.category,
        status: task.status,
      });
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    updateTask(task.id, {
      title: editForm.title,
      description: editForm.description,
      dueDate: editForm.dueDate ? new Date(editForm.dueDate) : undefined,
      estimatedTime: editForm.estimatedTime || undefined,
      priority: editForm.priority,
      category: editForm.category,
      status: editForm.status,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm("정말로 이 일정을 삭제하시겠습니까?")) {
      deleteTask(task.id);
      onClose();
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "done":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "in-progress":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700";
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
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

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: "todo", label: "할일" },
    { value: "in-progress", label: "진행중" },
    { value: "done", label: "완료" },
  ];

  const priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: "low", label: "낮음" },
    { value: "medium", label: "보통" },
    { value: "high", label: "높음" },
    { value: "urgent", label: "긴급" },
  ];

  const categoryOptions: { value: TaskCategory; label: string }[] = [
    { value: "업무", label: "업무" },
    { value: "개인", label: "개인" },
    { value: "건강", label: "건강" },
    { value: "쇼핑", label: "쇼핑" },
    { value: "약속", label: "약속" },
    { value: "학습", label: "학습" },
    { value: "운동", label: "운동" },
    { value: "기타", label: "기타" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="text-xl font-semibold mb-2"
                  placeholder="할일 제목"
                />
              ) : (
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {task.title}
                </h2>
              )}

              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getStatusColor(isEditing ? editForm.status : task.status)
                  )}
                >
                  {isEditing
                    ? statusOptions.find((s) => s.value === editForm.status)
                        ?.label
                    : statusOptions.find((s) => s.value === task.status)?.label}
                </span>
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getPriorityColor(
                      isEditing ? editForm.priority : task.priority
                    )
                  )}
                >
                  {isEditing
                    ? priorityOptions.find((p) => p.value === editForm.priority)
                        ?.label
                    : priorityOptions.find((p) => p.value === task.priority)
                        ?.label}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                  {isEditing
                    ? categoryOptions.find((c) => c.value === editForm.category)
                        ?.label
                    : task.category}
                </span>
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="p-2"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                설명
              </label>
              {isEditing ? (
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={3}
                  placeholder="할일 설명을 입력하세요"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {task.description || "설명이 없습니다."}
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  마감일
                </label>
                {isEditing ? (
                  <Input
                    type="datetime-local"
                    value={editForm.dueDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dueDate: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    {task.dueDate
                      ? format(task.dueDate, "yyyy년 MM월 dd일 HH:mm", {
                          locale: ko,
                        })
                      : "설정되지 않음"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  예상 소요시간
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editForm.estimatedTime}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        estimatedTime: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="분 단위"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    {task.estimatedTime
                      ? `${task.estimatedTime}분`
                      : "설정되지 않음"}
                  </p>
                )}
              </div>
            </div>

            {/* Edit Form Fields */}
            {isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    상태
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as TaskStatus,
                      })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    우선순위
                  </label>
                  <select
                    value={editForm.priority}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    카테고리
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        category: e.target.value as TaskCategory,
                      })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  태그
                </label>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Info */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div>
                  <span className="font-medium">생성일:</span>{" "}
                  {format(task.createdAt, "yyyy년 MM월 dd일 HH:mm", {
                    locale: ko,
                  })}
                </div>
                <div>
                  <span className="font-medium">수정일:</span>{" "}
                  {format(task.updatedAt, "yyyy년 MM월 dd일 HH:mm", {
                    locale: ko,
                  })}
                </div>
                {task.completedAt && (
                  <div className="md:col-span-2">
                    <span className="font-medium">완료일:</span>{" "}
                    {format(task.completedAt, "yyyy년 MM월 dd일 HH:mm", {
                      locale: ko,
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {isEditing && (
            <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button onClick={handleSave} className="flex-1">
                저장
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

