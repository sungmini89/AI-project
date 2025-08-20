import { useState } from "react";
import {
  DndContext,
  closestCenter,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import type { Task, TaskStatus } from "../../types";
import { useTaskStore } from "@/stores";
import KanbanColumn from "./KanbanColumn";
import { cn } from "@/utils";

/**
 * KanbanBoard 컴포넌트의 속성 정의
 * @interface KanbanBoardProps
 */
interface KanbanBoardProps {
  /** 추가적인 CSS 클래스 */
  className?: string;
}

/**
 * 칸반 보드의 컬럼 설정
 * @description 각 컬럼의 ID, 제목, 배경색, 헤더색을 정의합니다
 * @constant
 */
const COLUMN_CONFIG = [
  {
    id: "todo" as TaskStatus,
    title: "할 일",
    color: "bg-gray-100 dark:bg-gray-800",
    headerColor: "text-gray-700 dark:text-gray-300",
  },
  {
    id: "in-progress" as TaskStatus,
    title: "진행중",
    color: "bg-blue-50 dark:bg-blue-900/20",
    headerColor: "text-blue-700 dark:text-blue-300",
  },
  {
    id: "done" as TaskStatus,
    title: "완료",
    color: "bg-green-50 dark:bg-green-900/20",
    headerColor: "text-green-700 dark:text-green-300",
  },
];

/**
 * 드래그 앤 드롭 기능이 있는 칸반 보드 컴포넌트
 *
 * @description
 * 할일을 3개의 컬럼(할 일, 진행중, 완료)으로 나누어 표시하는 칸반 보드입니다.
 *
 * 주요 기능:
 * - 드래그 앤 드롭으로 할일 상태 변경
 * - 같은 컬럼 내에서 순서 변경
 * - 키보드 접근성 지원
 * - 터치 디바이스 지원
 * - 할일 개수 실시간 표시
 *
 * @param {KanbanBoardProps} props - 컴포넌트 속성
 * @returns {JSX.Element} 렌더링된 칸반 보드
 *
 * @example
 * <KanbanBoard className="my-4" />
 */
export default function KanbanBoard({ className }: KanbanBoardProps) {
  const { tasks, updateTask, getTasksByStatus, reorderTasks } = useTaskStore();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 더 민감하게 설정
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    console.log("Drag ended:", { activeId: active.id, overId: over?.id });

    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;

    let newStatus: TaskStatus;
    let newColumn: TaskStatus | null = null;

    if (overId.startsWith("column-")) {
      newColumn = overId.replace("column-", "") as TaskStatus;
      newStatus = newColumn;
      console.log("Dropping on column:", newColumn);
    } else {
      const overTask = tasks.find((task) => task.id === overId);
      if (!overTask) return;
      newStatus = overTask.status;
      console.log("Dropping on task:", {
        overTask: overTask.title,
        status: overTask.status,
      });
    }

    // 다른 칸으로 이동하는 경우 (상태 변경)
    if (activeTask.status !== newStatus) {
      const updates: Partial<Task> = {
        status: newStatus,
        updatedAt: new Date(),
      };

      if (newStatus === "done") {
        updates.completedAt = new Date();
      } else if (activeTask.completedAt) {
        updates.completedAt = undefined;
      }

      updateTask(activeTask.id, updates);
    }
    // 같은 칸 내에서 순서 변경하는 경우 (우선순위 변경)
    else if (!overId.startsWith("column-")) {
      console.log("Same column reordering detected");
      const columnTasks = getTasksByStatus(newStatus);
      const oldIndex = columnTasks.findIndex(
        (task) => task.id === activeTask.id
      );
      const newIndex = columnTasks.findIndex((task) => task.id === over.id);

      console.log("Reordering:", {
        activeTask: activeTask.title,
        oldIndex,
        newIndex,
        currentPriority: activeTask.priority,
        columnTasksCount: columnTasks.length,
      });

      if (oldIndex !== newIndex && newIndex !== -1) {
        // 먼저 순서를 변경
        reorderTasks(newStatus, oldIndex, newIndex);
        console.log("Tasks reordered successfully");

        // 그다음 위치에 따라 우선순위 변경 (선택적)
        const priorities: Task["priority"][] = [
          "low",
          "medium",
          "high",
          "urgent",
        ];

        let newPriority: Task["priority"] = activeTask.priority;

        // 맨 위로 이동하는 경우
        if (newIndex === 0) {
          newPriority = "urgent";
        }
        // 맨 아래로 이동하는 경우
        else if (newIndex >= columnTasks.length - 1) {
          newPriority = "low";
        }

        console.log("Priority change:", {
          from: activeTask.priority,
          to: newPriority,
          willUpdate: newPriority !== activeTask.priority,
        });

        if (newPriority !== activeTask.priority) {
          updateTask(activeTask.id, {
            priority: newPriority,
            updatedAt: new Date(),
          });
          console.log("Priority updated successfully");
        } else {
          console.log("No priority change needed");
        }
      }
    }
  };

  const getTasksForColumn = (status: TaskStatus): Task[] => {
    // 우선순위 정렬을 제거하고 단순히 store의 순서를 유지
    // 드래그 앤 드롭으로 변경된 순서가 유지되도록 함
    return getTasksByStatus(status);
  };

  return (
    <div className={cn("h-full", className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {COLUMN_CONFIG.map((column) => {
            const columnTasks = getTasksForColumn(column.id);
            const taskIds = columnTasks.map((task) => task.id);

            return (
              <SortableContext
                key={column.id}
                items={taskIds}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn
                  id={column.id}
                  title={column.title}
                  tasks={columnTasks}
                  color={column.color}
                  headerColor={column.headerColor}
                  activeId={activeId}
                />
              </SortableContext>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
