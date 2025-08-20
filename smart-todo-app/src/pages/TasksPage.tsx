import { useState } from "react";
import { Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui";
import { TaskQuickAdd, KanbanBoard, TaskCard } from "@/components/features";
import { useTaskStore } from "@/stores";

import { TASK_CATEGORIES, TASK_PRIORITIES } from "@/constants";
import { cn } from "@/utils";

type ViewMode = "kanban" | "list";

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [showFilters, setShowFilters] = useState(false);
  const { getFilteredTasks, filter, setFilter } = useTaskStore();

  const filteredTasks = getFilteredTasks();

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilter({ [key]: value || undefined });
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              할일 관리
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              할일을 생성, 편집, 관리하세요
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-gray-100 dark:bg-gray-800")}
            >
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>

            <div className="flex rounded-md border border-gray-200 dark:border-gray-700">
              <Button
                variant={viewMode === "kanban" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <TaskQuickAdd />

        {showFilters && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  상태
                </label>
                <select
                  value={filter.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">전체</option>
                  <option value="todo">할 일</option>
                  <option value="in-progress">진행중</option>
                  <option value="done">완료</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  카테고리
                </label>
                <select
                  value={filter.category || ""}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">전체</option>
                  {TASK_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  우선순위
                </label>
                <select
                  value={filter.priority || ""}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">전체</option>
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter({})}
                  className="w-full"
                >
                  초기화
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === "kanban" ? (
          <KanbanBoard />
        ) : (
          <div className="space-y-3 overflow-y-auto h-full">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">할일이 없습니다</h3>
                  <p className="text-sm mb-4">새로운 할일을 추가해보세요!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
