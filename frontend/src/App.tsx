import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/Layout/Layout'
import { PageLoader } from './components/ui/LoadingSpinner'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const TemplatesPage = lazy(() => import('./pages/templates/TemplatesPage'))
const TemplateEditorPage = lazy(() => import('./pages/templates/TemplateEditorPage'))
const GiftCardsPage = lazy(() => import('./pages/gift-cards/GiftCardsPage'))
const GiftCardCreatorPage = lazy(() => import('./pages/gift-cards/GiftCardCreatorPage'))
const BulkGiftCardPage = lazy(() => import('./pages/gift-cards/BulkGiftCardPage'))
const EmailTemplatesPage = lazy(() => import('./pages/email/EmailTemplatesPage'))
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'))
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'))

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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
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
