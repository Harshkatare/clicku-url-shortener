import { Routes, Route, Navigate } from "react-router-dom";

import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LandingPage } from "../pages/LandingPage";
import { DeactivatedPage } from "../pages/DeactivatedPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { QRStudioPage } from "../pages/QRStudioPage";
import { AdminDashboardPage } from "../pages/AdminDashboardPage";
import { PrivacyPage } from "../pages/PrivacyPage";
import { TermsPage } from "../pages/TermsPage";

import { ProtectedRoute } from "./ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={<LandingPage />} 
      />
      <Route 
        path="/login" 
        element={<LoginPage />} 
      />

      <Route 
        path="/register" 
        element={<RegisterPage />} 
      />
      <Route 
        path="/deactivated" 
        element={<DeactivatedPage />} 
      />
      <Route 
        path="/privacy" 
        element={<PrivacyPage />} 
      />
      <Route 
        path="/terms" 
        element={<TermsPage />} 
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />
        <Route
          path="/admin"
          element={<AdminDashboardPage />}
        />
        <Route
          path="/analytics"
          element={<AnalyticsPage />}
        />
        <Route
          path="/settings"
          element={<SettingsPage />}
        />
        <Route
          path="/qr-studio"
          element={<QRStudioPage />}
        />
      </Route>

      {/* Fallback route for undefined paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
