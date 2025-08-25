import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout";
import { useSettingsStore } from "@/stores";
import Dashboard from "@/pages/Dashboard";
import TasksPage from "@/pages/TasksPage";
import CalendarPage from "@/pages/CalendarPage";
import PomodoroPage from "@/pages/PomodoroPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";

function App() {
  const { theme } = useSettingsStore();

  // 앱 시작시 테마 강제 적용
  useEffect(() => {
    console.log("App 시작, 현재 테마:", theme);

    // 기존 클래스 제거
    document.documentElement.classList.remove("dark");

    // 테마에 따라 클래스 추가
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }

    console.log("App에서 설정된 클래스:", document.documentElement.className);
  }, [theme]);
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/pomodoro" element={<PomodoroPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
