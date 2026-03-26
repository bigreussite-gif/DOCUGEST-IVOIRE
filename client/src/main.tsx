import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./docugest.css";
import App from "./App.tsx";
import { initOfflineSync } from "./lib/offline/initSync";
import { registerSW } from "virtual:pwa-register";

initOfflineSync();

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
