import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  BellOff,
  User,
  Sun,
  Moon,
  Settings,
  LogOut,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useSettingsStore, useTaskStore } from "@/stores";
import { useTranslation } from "@/hooks";
import { cn } from "@/utils";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, updateTheme, notifications, updateNotifications } =
    useSettingsStore();
  const { setFilter } = useTaskStore();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilter({ search: query || undefined });
  };

  const cycleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    updateTheme(nextTheme);
  };

  const toggleNotifications = () => {
    updateNotifications({ enabled: !notifications.enabled });
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return Sun;
      case "dark":
        return Moon;
      default:
        return Sun;
    }
  };

  const ThemeIcon = getThemeIcon();

  // 사용자 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header
      className={cn(
        "flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800",
        className
      )}
    >
      <div className="flex items-center flex-1 max-w-lg">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={cycleTheme}
          className="p-2"
          title={`${t("theme")}: ${
            theme === "light" ? t("themeLight") : t("themeDark")
          }`}
        >
          <ThemeIcon className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleNotifications}
          className="p-2 relative"
          title={`${t("notifications")}: ${
            notifications.enabled ? t("notificationsOn") : t("notificationsOff")
          }`}
        >
          {notifications.enabled ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
          {notifications.enabled && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"></span>
          )}
        </Button>

        <div className="relative" ref={userMenuRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleUserMenu}
            className="p-2"
            title={t("userMenu")}
          >
            <User className="h-5 w-5" />
          </Button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate("/settings");
                    setShowUserMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {t("settings")}
                </button>
                <button
                  onClick={() => {
                    // TODO: 로그아웃 기능
                    setShowUserMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("logout")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
