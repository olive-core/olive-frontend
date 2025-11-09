import { Route, Routes } from "react-router";
import HomePage from "./pages";
import RootLayout from "./layouts/root-layout";
import AuthLayout from "./layouts/auth-layout";
import SignInPage from "./pages/auth/sign-in";
import SignUpPage from "./pages/auth/sign-up";
import DashboardLayout from "./layouts/dashboard-layout";
import DashboardPage from "./pages/dashboard";
import NewConsultationPage from "./pages/dashboard/new-consultation";
import HistoryPage from "./pages/dashboard/history";
import SettingsPage from "./pages/dashboard/settings";
import NotFoundPage from "./pages/not-found";
import SingleHistoryPage from "./pages/dashboard/history/single-history";
import ComingSoonPage from "./pages/coming-soon";

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
          <Route path="sign-up" element={<SignUpPage />} />
        </Route>

        <Route path="dashboard/*" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="new-consultation" element={<NewConsultationPage />} />
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