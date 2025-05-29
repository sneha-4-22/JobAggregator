import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi'
import { useUser } from '../context/UserContext'
import { account } from '../appwrite'

function VerifyEmail() {
  const [verificationStatus, setVerificationStatus] = useState('pending')
  const [verificationError, setVerificationError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const { current, isVerified, checkVerificationStatus } = useUser()
  const navigate = useNavigate()
  const location = useLocation()

  // Parse the URL for verification parameters
  useEffect(() => {
    const handleVerification = async () => {
      const urlParams = new URLSearchParams(location.search)
      const userId = urlParams.get('userId')
      const secret = urlParams.get('secret')
      
      if (userId && secret) {
        setVerificationStatus('verifying')
        try {
          // Complete verification
          await account.updateVerification(userId, secret)
          setVerificationStatus('success')
          // Check verification status
          await checkVerificationStatus()
          // Redirect to dashboard after a short delay
          setTimeout(() => navigate('/dashboard'), 2000)
        } catch (error) {
          console.error('Verification error:', error)
          setVerificationStatus('error')
          setVerificationError(error.message || 'Verification failed')
        }
      }
    }
    
    handleVerification()
  }, [location.search, checkVerificationStatus, navigate])

  // Check if already verified
  useEffect(() => {
    if (isVerified) {
      setVerificationStatus('success')
      // Redirect to dashboard if already verified
      setTimeout(() => navigate('/dashboard'), 2000)
    }
  }, [isVerified, navigate])

  // Redirect if not logged in
  useEffect(() => {
    if (!current) {
      navigate('/login')
    }
  }, [current, navigate])

  const handleResendVerification = async () => {
    if (!current) return

    setResendLoading(true)
    setResendMessage('')
    
    try {
      const url = window.location.origin + '/verify-email'
      await account.createVerification(url)
      setResendMessage('Verification email sent successfully! Please check your inbox.')
    } catch (error) {
      console.error('Resend verification error:', error)
      setResendMessage('Failed to send verification email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const renderVerificationStatus = () => {
    if (verificationStatus === 'verifying') {
      return (
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/25">
              <FiLoader className="animate-spin text-white" size={36} />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Verifying Your Email</h2>
          <p className="text-xl text-gray-300">
            Please wait while we verify your email address...
          </p>
        </div>
      )
    }
    
    if (verificationStatus === 'success') {
      return (
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/25">
              <FiCheck className="text-white" size={36} />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Email Verified!</h2>
          <p className="text-xl text-gray-300 mb-8">
            Your email has been successfully verified. Redirecting you to your dashboard...
          </p>
          <div className="flex items-center justify-center">
            <FiLoader className="animate-spin text-blue-400 mr-3" size={20} />
            <span className="text-blue-400 font-semibold">Redirecting...</span>
          </div>
        </div>
      )
    }
    
    if (verificationStatus === 'error') {
      return (
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-2xl shadow-red-500/25">
              <FiAlertCircle className="text-white" size={36} />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Verification Failed</h2>
          <p className="text-red-400 mb-8 text-lg">
            {verificationError || 'We could not verify your email. The link may be expired or invalid.'}
          </p>
          <div className="space-y-6">
            <button 
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {resendLoading ? (
                <span className="flex items-center justify-center">
                  <FiLoader className="animate-spin mr-2" />
                  Sending...
                </span>
              ) : (
                'Resend Verification Email'
              )}
            </button>
            <div>
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white underline text-lg transition-colors duration-300"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
          {resendMessage && (
            <div className={`mt-6 p-4 rounded-xl border ${
              resendMessage.includes('successfully') 
                ? 'bg-green-900/50 text-green-400 border-green-500/30' 
                : 'bg-red-900/50 text-red-400 border-red-500/30'
            }`}>
              {resendMessage}
            </div>
          )}
        </div>
      )
    }
    
    return (
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/25">
            <FiMail className="text-white" size={36} />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Check Your Email</h2>
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          We&#39;ve sent a verification link to your email address.
          Please check your inbox and click the link to verify your account.
        </p>
        <div className="space-y-6">
          <button 
            onClick={handleResendVerification}
            disabled={resendLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {resendLoading ? (
              <span className="flex items-center justify-center">
                <FiLoader className="animate-spin mr-2" />
                Sending...
              </span>
            ) : (
              'Resend Verification Email'
            )}
          </button>
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white underline text-lg transition-colors duration-300"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
        {resendMessage && (
          <div className={`mt-6 p-4 rounded-xl border ${
            resendMessage.includes('successfully') 
              ? 'bg-green-900/50 text-green-400 border-green-500/30' 
              : 'bg-red-900/50 text-red-400 border-red-500/30'
          }`}>
            {resendMessage}
          </div>
        )}
        <p className="text-sm text-gray-500 mt-6">
          If you don&#39;t see the email, check your spam folder.
        </p>
      </div>
    )
  }

  // Don't render if not logged in (will redirect)
  if (!current) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <motion.div 
          className="bg-gray-800 rounded-2xl p-8 md:p-12 shadow-2xl border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderVerificationStatus()}
        </motion.div>
      </div>
      
      {/* Background decoration matching landing page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>
    </div>
  )
}

export default VerifyEmail