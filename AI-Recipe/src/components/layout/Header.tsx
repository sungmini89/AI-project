import { ChefHat, Moon, Sun, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ darkMode, onToggleDarkMode }: HeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">{t("home.appTitle")}</h1>
          </div>

          <nav className="flex items-center gap-4">
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Settings className="h-4 w-4" />
                <span className="sr-only">{t("accessibility.settings")}</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDarkMode}
              className="h-9 w-9"
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">{t("accessibility.toggleTheme")}</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
