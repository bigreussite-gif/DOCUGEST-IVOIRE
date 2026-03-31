import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdSlotsBootstrap } from "./components/promo/AdSlotsBootstrap";
import Landing from "./views/Landing";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import NextFullPageRedirect from "./views/NextFullPageRedirect";

const AdminApp = lazy(() => import("./views/admin/AdminApp"));

export default function App() {
  return (
    <BrowserRouter>
      <AdSlotsBootstrap />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<NextFullPageRedirect path="/forgot-password" />} />
        <Route path="/reset-password" element={<NextFullPageRedirect path="/reset-password" />} />
        <Route path="/register" element={<NextFullPageRedirect path="/register" />} />
        <Route path="/setup-super-admin" element={<NextFullPageRedirect path="/setup-super-admin" />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="p-8 text-center text-slate-600">Chargement admin…</div>}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
