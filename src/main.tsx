import { createRoot } from "react-dom/client";
import "@/styles/index.css";
import { AppProvider } from "@/app/AppProvider";
import { App } from "@/App";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root");

createRoot(rootEl).render(
  <AppProvider>
    <App />
  </AppProvider>
);



