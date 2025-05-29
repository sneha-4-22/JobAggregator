import { Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from './context/UserContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import UploadResume from './pages/UploadResume'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
function App() {
  const { current, loading, isVerified } = useUser()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-primary-600 text-xl animate-pulse">Loading amazing opportunities...</div>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<LandingPage />} />
        <Route path="login" element={<Login />} />
        <Route path="upload-resume" element={<UploadResume />} />
        <Route path="verify-email" element={<VerifyEmail />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute isAllowed={!!current} redirectPath="/" />}>
          <Route 
            path="dashboard" 
            element={
              isVerified 
                ? <Dashboard /> 
                : <Navigate to="/verify-email\" replace />
            } 
          />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App