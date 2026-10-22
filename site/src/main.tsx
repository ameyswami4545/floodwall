import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/theme.css";
import "./styles/shared.css";
import "./styles/landing/scenes.css";
import "./styles/landing/header.css";
import "./styles/landing/hero.css";
import "./styles/landing/sections.css";
import "./styles/landing/footer.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
