import { useDroppable, type UniqueIdentifier } from "@dnd-kit/core";
import type { Task, TaskStatus } from "../../types";
import KanbanTaskCard from "./KanbanTaskCard";
import { cn } from "@/utils";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
  headerColor: string;
  activeId: UniqueIdentifier | null;
}

export default function KanbanColumn({
  id,
  title,
  tasks,
  color,
  headerColor,
  activeId,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `column-${id}`,
  });

  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-t-lg border-b",
          color,
          "border-gray-200 dark:border-gray-700"
        )}
      >
        <h3 className={cn("font-semibold", headerColor)}>{title}</h3>
        <span
          className={cn(
            "px-2 py-1 text-xs font-medium rounded-full",
            "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          )}
        >
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "kanban-column-content flex-1 p-4 space-y-3 overflow-y-auto transition-colors",
          color,
          isOver && "ring-2 ring-blue-500 ring-opacity-50",
          "rounded-b-lg min-h-[200px] max-h-[calc(100vh-300px)]"
        )}
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        {tasks.map((task) => (
          <KanbanTaskCard
            key={task.id}
            task={task}
            isDragging={activeId === task.id}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {id === "todo" && "새로운 할일을 추가해보세요"}
              {id === "in-progress" && "진행중인 작업이 없습니다"}
              {id === "done" && "완료된 작업이 없습니다"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
