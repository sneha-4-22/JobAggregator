import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { FiUpload, FiFile, FiLoader, FiEdit3, FiEye, FiEyeOff } from 'react-icons/fi'
import { useUser } from '../context/UserContext'

function UploadResume() {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [extractedEmail, setExtractedEmail] = useState('')
  const [editableEmail, setEditableEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState('upload') // 'upload', 'confirm', 'registering'
  const [registrationStatus, setRegistrationStatus] = useState('')
  
  // Use the correct function from UserContext
  const { registerWithResumeAndPassword } = useUser()
  const navigate = useNavigate()

  const onDrop = acceptedFiles => {
    setError('')
    
    // Check if file is PDF
    if (acceptedFiles[0]?.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }
    
    setFile(acceptedFiles[0])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const handleExtractEmail = async () => {
    if (!file) {
      setError('Please select a resume to upload')
      return
    }

    setUploading(true)
    setError('')
    
    try {
      // Create form data for upload
      const formData = new FormData()
      formData.append('resume', file)
      
      // Upload to extract email API
      const response = await fetch('https://gigi-back.onrender.com/api/extract-email', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to extract email from resume')
      }
      
      const data = await response.json()
      
      // If successful, show the extracted email for confirmation
      if (data.email) {
        setExtractedEmail(data.email)
        setEditableEmail(data.email)
        setStep('confirm')
      } else {
        setError('Could not extract email from resume. Please try again.')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to process resume')
    } finally {
      setUploading(false)
    }
  }

  const validateForm = () => {
    if (!editableEmail || !editableEmail.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    return true
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    setRegistrationStatus('registering')
    setError('')
    
    try {
      // Use the correct function that processes resume during registration
      const result = await registerWithResumeAndPassword(
        editableEmail, 
        password, 
        file, // Pass the actual file object
        'Resume User' // Default name, will be overridden by resume data
      )
      
      if (result.userId) {
        setRegistrationStatus('success')
        // Redirect to dashboard since profile is already created
        setTimeout(() => navigate('/dashboard'), 2000)
      }
    } catch (regError) {
      console.error('Registration error:', regError)
      setError(regError.message || 'Registration failed')
      setRegistrationStatus('failed')
    }
  }

  const renderUploadStep = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Upload Your Resume</h1>
        <p className="text-gray-300">
          We&#39;ll create your account and extract your profile information from your resume.
        </p>
      </div>
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 mb-6 transition-all duration-300 text-center cursor-pointer
          ${isDragActive 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-600 hover:border-blue-500 hover:bg-blue-500/5'
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          {file ? (
            <>
              <FiFile className="text-blue-400 mb-4" size={40} />
              <p className="text-blue-400 font-medium text-lg">{file.name}</p>
              <p className="text-gray-400 text-sm mt-2">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <FiUpload className="text-gray-400 mb-4" size={40} />
              <p className="text-white font-medium text-lg mb-2">
                Drag & drop your resume here
              </p>
              <p className="text-gray-400 text-sm">
                (PDF file only, max 5MB)
              </p>
            </>
          )}
        </div>
      </div>
      
      <div className="text-center">
        <button 
          onClick={handleExtractEmail}
          disabled={!file || uploading}
          className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 w-full ${
            (!file || uploading) 
              ? 'opacity-50 cursor-not-allowed hover:scale-100' 
              : 'hover:shadow-xl hover:shadow-blue-500/25'
          }`}
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <FiLoader className="animate-spin mr-2" />
              Processing...
            </span>
          ) : (
            'Extract Email & Continue'
          )}
        </button>
      </div>
    </>
  )

  const renderConfirmStep = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Create Your Account</h1>
        <p className="text-gray-300">
          Confirm your email and set a password. Your profile will be automatically created from your resume.
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={editableEmail}
              onChange={(e) => setEditableEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
            <FiEdit3 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {extractedEmail !== editableEmail && (
            <p className="text-yellow-400 text-sm mt-1">
              Original: {extractedEmail}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Must be at least 8 characters long
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4 mt-8">
        <button 
          onClick={() => setStep('upload')}
          className="flex-1 border border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-400 font-semibold px-6 py-3 rounded-full transition-all duration-300"
        >
          Back
        </button>
        <button 
          onClick={handleRegister}
          disabled={registrationStatus === 'registering'}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Create Account & Process Resume
        </button>
      </div>
    </>
  )

  const renderStatus = () => {
    if (registrationStatus === 'registering') {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 text-blue-400 mb-6">
          <FiLoader className="animate-spin text-2xl" />
          <div className="text-center">
            <p className="font-medium">Creating your account...</p>
            <p className="text-sm text-gray-400">This may take a few moments as we process your resume</p>
          </div>
        </div>
      )
    }
    
    if (registrationStatus === 'success') {
      return (
        <div className="text-center mb-6">
          <div className="text-green-400 mb-4 text-2xl">
            <span>✓ Account created successfully!</span>
          </div>
          <p className="text-gray-300 mb-2">
            Your profile has been created with your resume data.
          </p>
          <p className="text-gray-400 text-sm">
            Redirecting to dashboard...
          </p>
        </div>
      )
    }
    
    if (registrationStatus === 'failed') {
      return (
        <div className="text-center mb-6">
          <div className="text-red-400 mb-4">
            <span>✗ Registration failed</span>
          </div>
          <p className="text-gray-300">
            Please try again or contact support if the issue persists.
          </p>
        </div>
      )
    }
    
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
            {renderStatus()}
            
            {error && (
              <div className="mb-6 text-center">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}
            
            {step === 'upload' && renderUploadStep()}
            {step === 'confirm' && renderConfirmStep()}
            
            <div className="mt-6 text-center text-sm text-gray-400">
              <p>
                Already have an account?{' '}
                <button 
                  onClick={() => navigate('/login')}
                  className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-400">
              <p>
                By creating an account, you agree to our{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default UploadResume