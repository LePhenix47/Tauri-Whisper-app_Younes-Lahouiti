import React from "react";
import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import App from "./App";
import { QueryProvider } from "@app/providers/QueryProvider";
import "./env"; // Validate environment variables on startup
import "./tailwind.css"; // Tailwind CSS for HeroUI
import "./sass/main.scss"; // Custom SASS (loaded after Tailwind)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <QueryProvider>
        <App />
      </QueryProvider>
    </HeroUIProvider>
  </React.StrictMode>
);
