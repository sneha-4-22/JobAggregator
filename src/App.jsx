import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { useUser } from './context/UserContext'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import Hackathons from './pages/Hackathons'
import Jobs from './pages/Jobs'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import ResetPassword from './pages/ResetPassword'
import Settings from './pages/Settings'
import UploadResume from './pages/UploadResume'
import VerifyEmail from './pages/VerifyEmail'
import { Toaster } from 'react-hot-toast' 

function App() {
  const { current, loading, isVerified } = useUser()
     
  if (loading) {
  return (
    
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 relative overflow-hidden">
      
      {/* Animated background orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-600/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-400/10 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>
      
      {/* Main loading content */}
      <div className="text-center relative z-10 p-8">
        {/* Glowing container */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
          {/* Enhanced spinner */}
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-gray-600 rounded-full mx-auto"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-16 border-2 border-transparent border-t-purple-400 rounded-full animate-spin animate-reverse"></div>
          </div>
          
          {/* Stylish text with glow effect */}
          <div className="space-y-2">
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-2xl font-bold animate-pulse">
              ｡ﾟ☁︎｡
            </div>
            <div className="text-white text-xl font-medium tracking-wide drop-shadow-lg animate-pulse">
              Consulting the crystal ball...
            </div>
            <div className="text-6xl animate-bounce">
              🔮
            </div>
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 text-2xl font-bold animate-pulse">
              ｡ﾟ☁︎｡
            </div>
          </div>
          
          {/* Floating dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
  return (
    <>
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#374151',
          color: '#fff',
          border: '1px solid #4B5563'
        }
      }}
    />
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<LandingPage />} />
        <Route path="login" element={<Login />} />
        <Route path="upload-resume" element={<UploadResume />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="profile" element={<Settings />} />
        {/* Protected routes */}
        <Route element={<ProtectedRoute isAllowed={!!current} redirectPath="/" />}>
          <Route 
            path="dashboard" 
            element={
              isVerified 
                ? <Dashboard /> 
                : <Navigate to="/verify-email" replace />

            } 
          />
        </Route>
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/hackathons" element={<Hackathons />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </>
  )
}

export default App