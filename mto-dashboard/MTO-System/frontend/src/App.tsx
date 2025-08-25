import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ChatProvider } from './contexts/ChatContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Layout } from './layouts/Layout'

// Lazy load pages for better performance
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'))
const BrandDashboard = React.lazy(() => import('./pages/brand/BrandDashboard'))
const FactoryDashboard = React.lazy(() => import('./pages/factory/FactoryDashboard'))
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'))

// Brand pages
const BrandMTOList = React.lazy(() => import('./pages/brand/MTOList'))
const BrandUpload = React.lazy(() => import('./pages/brand/Upload'))
const BrandInventory = React.lazy(() => import('./pages/brand/Inventory'))
const BrandShipping = React.lazy(() => import('./pages/brand/Shipping'))
const BrandDefects = React.lazy(() => import('./pages/brand/Defects'))
const BrandAnalytics = React.lazy(() => import('./pages/brand/Analytics'))

// Factory pages
const FactoryWorkboard = React.lazy(() => import('./pages/factory/Workboard'))
const FactoryProduction = React.lazy(() => import('./pages/factory/Production'))
const FactoryInventory = React.lazy(() => import('./pages/factory/Inventory'))
const FactoryShipping = React.lazy(() => import('./pages/factory/Shipping'))
const FactoryDefects = React.lazy(() => import('./pages/factory/Defects'))

// Admin pages
const AdminUsers = React.lazy(() => import('./pages/admin/Users'))
const AdminCompanies = React.lazy(() => import('./pages/admin/Companies'))
const AdminAssignments = React.lazy(() => import('./pages/admin/BrandFactoryAssignments'))
const AdminReports = React.lazy(() => import('./pages/admin/Reports'))
const AdminOversight = React.lazy(() => import('./pages/admin/Oversight'))

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ChatProvider>
            <React.Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  {/* Brand routes */}
                  <Route path="/brand">
                    <Route index element={<BrandDashboard />} />
                    <Route path="mtos" element={<BrandMTOList />} />
                    <Route path="upload" element={<BrandUpload />} />
                    <Route path="inventory" element={<BrandInventory />} />
                    <Route path="shipping" element={<BrandShipping />} />
                    <Route path="defects" element={<BrandDefects />} />
                    <Route path="analytics" element={<BrandAnalytics />} />
                  </Route>

                  {/* Factory routes */}
                  <Route path="/factory">
                    <Route index element={<FactoryDashboard />} />
                    <Route path="workboard" element={<FactoryWorkboard />} />
                    <Route path="production" element={<FactoryProduction />} />
                    <Route path="inventory" element={<FactoryInventory />} />
                    <Route path="shipping" element={<FactoryShipping />} />
                    <Route path="defects" element={<FactoryDefects />} />
                  </Route>

                  {/* Admin routes */}
                  <Route path="/admin">
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="companies" element={<AdminCompanies />} />
                    <Route path="assignments" element={<AdminAssignments />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="oversight" element={<AdminOversight />} />
                  </Route>
                </Route>
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </React.Suspense>
          </ChatProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
)

const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-4xl font-bold text-gray-900">404</h1>
    <p className="text-gray-600 mt-2">Page not found</p>
  </div>
)

export default App