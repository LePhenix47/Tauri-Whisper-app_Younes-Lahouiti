import React from "react";
import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryProvider } from "@app/providers/QueryProvider";
import { routeTree } from "./routeTree.gen";
import "./env"; // Validate environment variables on startup
import "./tailwind.css"; // Tailwind CSS for HeroUI
import "./sass/main.scss"; // Custom SASS (loaded after Tailwind)

// Create router instance
const router = createRouter({ routeTree });

// Register router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </HeroUIProvider>
  </React.StrictMode>
);
