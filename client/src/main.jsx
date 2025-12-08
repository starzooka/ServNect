// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider.jsx";
import AuthWrapper from "./components/AuthWrapper.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthWrapper>
        <ThemeProvider defaultTheme="dark" storageKey="my-app-theme">
          <App />
        </ThemeProvider>
      </AuthWrapper>
    </BrowserRouter>
  </StrictMode>
);
