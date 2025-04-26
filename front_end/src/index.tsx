import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/globals.css";
import AuthPage from "./AuthPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import { WebSocketProvider } from "./functions/WebSocketContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <WebSocketProvider>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          {/* Optional: Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </WebSocketProvider>
    </BrowserRouter>
  </React.StrictMode>
);