import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiArrowLeft, FiCheck, FiLoader } from 'react-icons/fi'
import { useUser } from '../context/UserContext'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState('')
  const { sendPasswordRecoveryEmail } = useUser()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await sendPasswordRecoveryEmail(email)
      setIsEmailSent(true)
    } catch (error) {
      console.error('Password recovery error:', error)
      
      if (error.code === 404) {
        setError('No account found with this email address')
      } else {
        setError(error.message || 'Failed to send recovery email. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
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
              
              <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
              
              <p className="text-gray-300 mb-6">
                We&apos;ve sent a password recovery link to <strong>{email}</strong>. 
                Click the link in the email to reset your password.
              </p>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Didn&apos;t receive the email? Check your spam folder or try again in a few minutes.
                </p>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => {
                      setIsEmailSent(false)
                      setEmail('')
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    Try with a different email
                  </button>
                  
                  <Link 
                    to="/login"
                    className="inline-flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <FiArrowLeft className="mr-2" />
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-white">Forgot Password?</h1>
              <p className="text-gray-300">
                Enter your email address and we&apos;ll send you a link to reset your password.
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
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <FiLoader className="animate-spin mr-2" />
                    Sending...
                  </span>
                ) : (
                  'Send Recovery Email'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                to="/login"
                className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <FiArrowLeft className="mr-2" />
                Back to Login
              </Link>
            </div>

            <div className="mt-4 text-center text-sm text-gray-400">
              <p>
                Don&apos;t have an account?{' '}
                <Link 
                  to="/upload-resume" 
                  className="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium"
                >
                  Get started with your resume
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ForgotPassword