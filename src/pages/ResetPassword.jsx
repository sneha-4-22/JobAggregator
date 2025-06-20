import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiLock, FiEye, FiEyeOff, FiLoader, FiCheck } from 'react-icons/fi'
import { useUser } from '../context/UserContext'

function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { resetPassword } = useUser()

  const userId = searchParams.get('userId')
  const secret = searchParams.get('secret')

  useEffect(() => {
    // Check if required parameters are present
    if (!userId || !secret) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [userId, secret])

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    // Validate password strength
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!userId || !secret) {
      setError('Invalid reset link. Please request a new password reset.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await resetPassword(userId, secret, password)
      setIsSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successful! Please login with your new password.' }
        })
      }, 3000)
    } catch (error) {
      console.error('Password reset error:', error)
      
      if (error.code === 401) {
        setError('Invalid or expired reset link. Please request a new password reset.')
      } else {
        setError(error.message || 'Failed to reset password. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheck className="w-8 h-8 text-green-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">Password Reset Successful!</h1>
              
              <p className="text-gray-300 mb-6">
                Your password has been successfully reset. You will be redirected to the login page in a few seconds.
              </p>
              
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
              >
                Go to Login
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-white">Reset Password</h1>
              <p className="text-gray-300">
                Enter your new password below
              </p>
            </div>

            {error && (
              <div className="mb-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pl-12 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                  />
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Password must be at least 8 characters with uppercase, lowercase, and number
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pl-12 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                  />
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !userId || !secret}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <FiLoader className="animate-spin mr-2" />
                    Resetting Password...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Back to Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ResetPassword