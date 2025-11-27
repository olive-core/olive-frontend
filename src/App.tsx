import { Route, Routes } from "react-router";
import HomePage from "./pages";
import RootLayout from "./layouts/root-layout";
import AuthLayout from "./layouts/auth-layout";
import SignInPage from "./pages/auth/sign-in";
import DashboardLayout from "./layouts/dashboard-layout";
import DashboardPage from "./pages/dashboard";
import HistoryPage from "./pages/dashboard/history";
import SettingsPage from "./pages/dashboard/settings";
import NotFoundPage from "./pages/not-found";
import SingleHistoryPage from "./pages/dashboard/history/single-history";
import ComingSoonPage from "./pages/coming-soon";
import SessionPage from "./pages/dashboard/session";
import PrescribePage from "./pages/dashboard/prescribe";
import EnterOtpPage from "./pages/auth/enter-otp";

export default function App() {

  if (import.meta.env.VITE_ENV !== 'development') {
    return (
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="*" element={<ComingSoonPage />} />
        </Route>
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<RootLayout />}>

        <Route index element={<HomePage />} />

        <Route element={<AuthLayout />}>
          <Route path="sign-in" element={<SignInPage />} />
          <Route path="enter-otp" element={<EnterOtpPage />} />
        </Route>

        <Route path="dashboard/*" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="session/:id" element={<SessionPage />} />
          <Route path="prescribe/:id" element={<PrescribePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/:id" element={<SingleHistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="coming-soon" element={<ComingSoonPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}