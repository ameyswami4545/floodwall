import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/theme.css";
import "./landing/landing-header.css";
import "./landing/landing-hero.css";
import "./landing/landing-sections.css";
import "./landing/landing-footer.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
