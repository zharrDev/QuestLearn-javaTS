import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { PrivateRoute, RoleRoute } from '../components/layout/PrivateRoute'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { LeaderboardPage } from '../pages/leaderboard/LeaderboardPage'
import { ProfilePage } from '../pages/profile/ProfilePage'
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { ManageDuniaPage } from '../pages/admin/ManageDuniaPage'
import { ManageBadgePage } from '../pages/admin/ManageBadgePage'
import { NotFoundPage, ErrorPage } from '../pages/errors/NotFoundPage'
import TypingSelectPage from '../pages/typing/TypingSelectPage'
import TypingArenaPage from '../pages/typing/TypingArenaPage'
import TypingResultPage from '../pages/typing/TypingResultPage'

const UsersPage: React.FC = () => (
  <div className="p-8 max-w-5xl mx-auto">
    <h1 className="text-2xl font-bold">User Management</h1>
    <p className="text-warmGrey mt-2">
      Fitur list user dengan search & pagination tersedia di backend
    </p>
  </div>
)

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/dashboard"
        element={<PrivateRoute><DashboardPage /></PrivateRoute>}
      />
      <Route
        path="/leaderboard"
        element={<PrivateRoute><LeaderboardPage /></PrivateRoute>}
      />
      <Route
        path="/profile"
        element={<PrivateRoute><ProfilePage /></PrivateRoute>}
      />

      <Route
        path="/typing"
        element={<PrivateRoute><TypingSelectPage /></PrivateRoute>}
      />
      <Route
        path="/typing/arena"
        element={<PrivateRoute><TypingArenaPage /></PrivateRoute>}
      />
      <Route
        path="/typing/result"
        element={<PrivateRoute><TypingResultPage /></PrivateRoute>}
      />

      <Route
        path="/admin"
        element={<RoleRoute roles={['ADMIN']}><AdminDashboard /></RoleRoute>}
      />
      <Route
        path="/admin/dunia"
        element={<RoleRoute roles={['ADMIN']}><ManageDuniaPage /></RoleRoute>}
      />
      <Route
        path="/admin/badge"
        element={<RoleRoute roles={['ADMIN']}><ManageBadgePage /></RoleRoute>}
      />
      <Route
        path="/admin/users"
        element={<RoleRoute roles={['ADMIN']}><UsersPage /></RoleRoute>}
      />

      <Route path="/401" element={<ErrorPage code={401} title="Unauthorized" message="Kamu harus login" />} />
      <Route path="/403" element={<ErrorPage code={403} title="Forbidden" message="Kamu tidak punya akses" />} />
      <Route path="/500" element={<ErrorPage code={500} title="Server Error" message="Terjadi kesalahan" />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
