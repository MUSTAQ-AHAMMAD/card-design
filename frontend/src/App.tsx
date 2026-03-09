import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/Layout/Layout'
import { PageLoader } from './components/ui/LoadingSpinner'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import TemplatesPage from './pages/templates/TemplatesPage'
import TemplateEditorPage from './pages/templates/TemplateEditorPage'
import GiftCardsPage from './pages/gift-cards/GiftCardsPage'
import GiftCardCreatorPage from './pages/gift-cards/GiftCardCreatorPage'
import BulkGiftCardPage from './pages/gift-cards/BulkGiftCardPage'
import EmailTemplatesPage from './pages/email/EmailTemplatesPage'
import AdminPanel from './pages/admin/AdminPanel'
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import SettingsPage from './pages/settings/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

function AdminOrHRRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user?.role !== 'ADMIN' && user?.role !== 'HR_MANAGER') return <Navigate to="/" replace />
  return <>{children}</>
}

function RootRedirect() {
  const { user } = useAuth()
  if (user?.role === 'EMPLOYEE') return <EmployeeDashboard />
  return <DashboardPage />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/templates/new" element={
          <AdminOrHRRoute><TemplateEditorPage /></AdminOrHRRoute>
        } />
        <Route path="/templates/:id/edit" element={
          <AdminOrHRRoute><TemplateEditorPage /></AdminOrHRRoute>
        } />
        <Route path="/gift-cards" element={<GiftCardsPage />} />
        <Route path="/gift-cards/create" element={<GiftCardCreatorPage />} />
        <Route path="/gift-cards/bulk-send" element={
          <AdminOrHRRoute><BulkGiftCardPage /></AdminOrHRRoute>
        } />
        <Route path="/email-templates" element={<EmailTemplatesPage />} />
        <Route path="/admin" element={
          <AdminOrHRRoute><AdminPanel /></AdminOrHRRoute>
        } />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
