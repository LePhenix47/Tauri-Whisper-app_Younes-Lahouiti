import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/**
 * Global app state store
 *
 * Use this for app-wide state like UI preferences, settings, etc.
 *
 * NOTE: Theme styling is handled via CSS classes + CSS variables in SASS.
 * The theme state controls which class is applied to <html> in App.tsx.
 * Individual components NEVER handle theme classes - it's all CSS variables.
 */

interface AppState {
  // UI State
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;

  // Actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        theme: "system",
        sidebarOpen: true,

        // Actions
        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      }),
      {
        name: "app-storage", // localStorage key
        partialize: (state) => ({
          // Only persist these fields
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    { name: "AppStore" } // DevTools name
  )
);
