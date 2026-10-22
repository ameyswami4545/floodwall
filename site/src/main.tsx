import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./router";
import "./styles/theme.css";
import "./styles/shared.css";
import "./styles/landing/scenes.css";
import "./styles/landing/header.css";
import "./styles/landing/hero.css";
import "./styles/landing/sections.css";
import "./styles/landing/footer.css";
import "./styles/console/layout.css";
import "./styles/console/pieces.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
