import type { ReactNode } from "react";
import { cn } from "@/utils";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className={cn("flex-1 overflow-y-auto p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
