import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi'
import { useUser } from '../context/UserContext'
import { account } from '../appwrite'

function VerifyEmail() {
  const [verificationStatus, setVerificationStatus] = useState('pending')
  const [verificationError, setVerificationError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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
        } catch (error) {
          console.error('Verification error:', error)
          setVerificationStatus('error')
          setVerificationError(error.message || 'Verification failed')
        }
      }
    }
    
    handleVerification()
  }, [location.search, checkVerificationStatus])

  // Check if already verified
  useEffect(() => {
    if (isVerified) {
      setVerificationStatus('success')
    }
  }, [isVerified])

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    
    // Validation
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    
    setIsSubmitting(true)
    setPasswordError('')
    
    try {
      // Update password
      await account.updatePassword(newPassword)
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error('Password update error:', error)
      setPasswordError(error.message || 'Failed to update password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderVerificationStatus = () => {
    if (verificationStatus === 'verifying') {
      return (
        <div className="flex items-center justify-center space-x-2 text-primary-600">
          <FiLoader className="animate-spin\" size={24} />
          <span>Verifying your email...</span>
        </div>
      )
    }
    
    if (verificationStatus === 'success') {
      return (
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center">
              <FiCheck className="text-success-600" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified. Now, let's set up a password for your account.
          </p>
          
          <form onSubmit={handlePasswordUpdate} className="max-w-md mx-auto">
            <div className="mb-4">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                placeholder="Enter a new password"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Confirm your password"
                required
              />
            </div>
            
            {passwordError && (
              <div className="mb-4 text-center text-error-600">
                {passwordError}
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <FiLoader className="animate-spin mr-2" />
                  Updating...
                </span>
              ) : (
                'Set Password & Continue'
              )}
            </button>
          </form>
        </div>
      )
    }
    
    if (verificationStatus === 'error') {
      return (
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-error-100 flex items-center justify-center">
              <FiAlertCircle className="text-error-600" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
          <p className="text-error-600 mb-6">
            {verificationError || 'We could not verify your email. The link may be expired or invalid.'}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Return to Home
          </button>
        </div>
      )
    }
    
    return (
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <FiMail className="text-primary-600" size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
        <p className="text-gray-600 mb-6">
          We've sent a verification link to your email address.
          Please check your inbox and click the link to verify your account.
        </p>
        <p className="text-sm text-gray-500">
          If you don't see the email, check your spam folder or{' '}
          <button className="text-primary-600 hover:underline">
            click here to resend
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-16">
      <div className="container-custom">
        <motion.div 
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card">
            {renderVerificationStatus()}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default VerifyEmail