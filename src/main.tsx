import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryProvider } from "@app/providers/QueryProvider";
import "./env"; // Validate environment variables on startup
import "./sass/main.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>
);
