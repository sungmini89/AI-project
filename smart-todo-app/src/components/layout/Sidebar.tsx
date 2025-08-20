import { NavLink } from "react-router-dom";
import {
  Home,
  CheckSquare,
  Calendar,
  BarChart3,
  Timer,
  Settings,
} from "lucide-react";
import { cn } from "@/utils";
import { useTaskStore } from "@/stores";
import { useTranslation } from "@/hooks";

// navigation을 함수 안으로 이동하여 t() 함수를 사용할 수 있도록 함

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { tasks } = useTaskStore();
  const { t } = useTranslation();

  const navigation = [
    { name: t("dashboard"), href: "/", icon: Home },
    { name: t("tasks"), href: "/tasks", icon: CheckSquare },
    { name: t("calendar"), href: "/calendar", icon: Calendar },
    { name: t("analytics"), href: "/analytics", icon: BarChart3 },
    { name: t("pomodoro"), href: "/pomodoro", icon: Timer },
    { name: t("settings"), href: "/settings", icon: Settings },
  ];

  const todoCount = tasks.filter((task) => task.status === "todo").length;
  const inProgressCount = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;
  const overdueCount = tasks.filter(
    (task) =>
      task.dueDate && task.dueDate < new Date() && task.status !== "done"
  ).length;

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800",
        className
      )}
    >
      <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <h1 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
            스마트 할일
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
            {item.name === t("tasks") && todoCount > 0 && (
              <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                {todoCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>{t("inProgress")}</span>
            <span className="font-medium">{inProgressCount}</span>
          </div>
          {overdueCount > 0 && (
            <div className="flex justify-between text-red-600 dark:text-red-400">
              <span>{t("overdue")}</span>
              <span className="font-medium">{overdueCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
