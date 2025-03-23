// src/index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider as AppThemeProvider } from "./ThemeContext";

const rootElement = document.getElementById("root");

if (rootElement) {
  console.log("Root element found");
  try {
    ReactDOM.createRoot(rootElement).render(
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    );
    console.log("Rendering successful");
  } catch (error) {
    console.error("Error rendering app:", error);
  }
} else {
  console.error("Root element not found");
}

// Debugging IPC Renderer
if (window.ipcRenderer) {
  console.log("IPC Renderer found");
  window.ipcRenderer.on("main-process-message", (_event, message) => {
    console.log(message);
  });
} else {
  console.error("IPC Renderer not found");
}
