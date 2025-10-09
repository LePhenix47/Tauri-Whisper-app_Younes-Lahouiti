import { useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import { Select, SelectItem } from "@heroui/react";
import { useAppStore } from "@app/stores/useAppStore";

function App() {
  // Theme logic - ONLY place where theme class is applied
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const isDark =
        theme === "dark" || (theme === "system" && mediaQuery.matches);
      root.classList.toggle("dark", isDark);
    };

    // Apply theme immediately
    applyTheme();

    // Listen for OS theme changes when in system mode
    const handleChange = () => {
      if (theme === "system") applyTheme();
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Tauri Whisper App</h1>
        <Select
          label="Theme"
          selectedKeys={[theme]}
          onChange={(e) =>
            setTheme(e.target.value as "light" | "dark" | "system")
          }
          className="theme-switcher"
        >
          <SelectItem key="light">Light</SelectItem>
          <SelectItem key="dark">Dark</SelectItem>
          <SelectItem key="system">System</SelectItem>
        </Select>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
