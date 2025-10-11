import { useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import { useAppStore } from "@stores/useAppStore";
import { Sidebar } from "@components/shared/Sidebar/Sidebar";

function App() {
  // Theme logic - ONLY place where theme class is applied
  const theme = useAppStore((state) => state.theme);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const abortController = new AbortController();

    const applyTheme = (currentTheme: "light" | "dark" | "system") => {
      const isDark =
        currentTheme === "dark" ||
        (currentTheme === "system" && mediaQuery.matches);
      root.classList.toggle("dark", isDark);
      root.classList.toggle("light", !isDark);
    };

    // Apply theme immediately

    applyTheme(theme);

    // Listen for OS theme changes when in system mode
    const handleChange = () => {
      if (theme !== "system") {
        return;
      }
      applyTheme(theme);
    };

    mediaQuery.addEventListener("change", handleChange, {
      signal: abortController.signal,
    });
    return () => {
      abortController.abort();
    };
  }, [theme]);

  return (
    <div className="app-layout">
      <Sidebar />

      <main
        className={`app-content ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default App;
