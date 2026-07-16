import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { PrivateRoute, RoleRoute } from '../components/layout/PrivateRoute'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { DuniaListPage } from '../pages/dunia/DuniaListPage'
import { WorldMapPage } from '../pages/dunia/WorldMapPage'
import { LevelMapPage } from '../pages/dunia/LevelMapPage'
import { QuestPage } from '../pages/quest/QuestPage'
import { LeaderboardPage } from '../pages/leaderboard/LeaderboardPage'
import { ProfilePage } from '../pages/profile/ProfilePage'
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { ManageDuniaPage } from '../pages/admin/ManageDuniaPage'
import { ManageSoalPage } from '../pages/admin/ManageSoalPage'
import { ManageLevelPage } from '../pages/admin/ManageLevelPage'
import { ManageBadgePage } from '../pages/admin/ManageBadgePage'
import { NotFoundPage, ErrorPage } from '../pages/errors/NotFoundPage'
import { RPGHubPage } from '../pages/rpg/RPGHubPage'
import { RPGCustomizePage } from '../pages/rpg/RPGCustomizePage'
import { RPGDuniaPage } from '../pages/rpg/RPGDuniaPage'

const UsersPage: React.FC = () => (
  <div className="p-8 max-w-5xl mx-auto">
    <h1 className="text-2xl font-bold">User Management</h1>
    <p className="text-warmGrey mt-2">
      Fitur list user dengan search & pagination tersedia di backend: GET
      /api/admin/users?search=&role=&page=&size=
    </p>
  </div>
)

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* World Map — Primary world selection screen */}
      <Route
        path="/worldmap"
        element={
          <PrivateRoute>
            <WorldMapPage />
          </PrivateRoute>
        }
      />

      {/* Dunia list — Redirects to /worldmap */}
      <Route
        path="/dunia"
        element={
          <PrivateRoute>
            <DuniaListPage />
          </PrivateRoute>
        }
      />

      {/* Level map for specific world */}
      <Route
        path="/dunia/:id"
        element={
          <PrivateRoute>
            <LevelMapPage />
          </PrivateRoute>
        }
      />

      {/* Quest page */}
      <Route
        path="/quest/:levelId"
        element={
          <PrivateRoute>
            <QuestPage />
          </PrivateRoute>
        }
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      {/* Leaderboard */}
      <Route
        path="/leaderboard"
        element={
          <PrivateRoute>
            <LeaderboardPage />
          </PrivateRoute>
        }
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />

      {/* RPG Mode */}
      <Route
        path="/rpg"
        element={
          <PrivateRoute>
            <RPGHubPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/rpg/customize"
        element={
          <PrivateRoute>
            <RPGCustomizePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/rpg/dunia/:id"
        element={
          <PrivateRoute>
            <RPGDuniaPage />
          </PrivateRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <RoleRoute roles={['ADMIN']}>
            <AdminDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/dunia"
        element={
          <RoleRoute roles={['ADMIN']}>
            <ManageDuniaPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/level"
        element={
          <RoleRoute roles={['ADMIN']}>
            <ManageLevelPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/soal"
        element={
          <RoleRoute roles={['ADMIN']}>
            <ManageSoalPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/badge"
        element={
          <RoleRoute roles={['ADMIN']}>
            <ManageBadgePage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RoleRoute roles={['ADMIN']}>
            <UsersPage />
          </RoleRoute>
        }
      />

      {/* Error routes */}
      <Route path="/401" element={<ErrorPage code={401} title="Unauthorized" message="Kamu harus login" />} />
      <Route path="/403" element={<ErrorPage code={403} title="Forbidden" message="Kamu tidak punya akses" />} />
      <Route path="/500" element={<ErrorPage code={500} title="Server Error" message="Terjadi kesalahan" />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
