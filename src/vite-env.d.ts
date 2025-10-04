/// <reference types="vite/client" />

export interface ImportMetaEnv {
  // Vite built-in variables
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;

  readonly REACT_APP_NODE_ENV: "development" | "production" | "test";
  // Add your custom environment variables here (must start with VITE_)
  // readonly VITE_API_URL: string;
  // readonly VITE_API_KEY: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
