import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { FiUpload, FiFile, FiCheck, FiLoader, FiXCircle } from 'react-icons/fi'
import { useUser } from '../context/UserContext'
import axios from 'axios'

function UploadResume() {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [extractedEmail, setExtractedEmail] = useState('')
  const [registrationStatus, setRegistrationStatus] = useState('')
  const { registerWithEmail } = useUser()
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

  const handleUpload = async () => {
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
      const response = await axios.post('http://localhost:5000/api/extract-email', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // If successful, show the extracted email
      if (response.data.email) {
        setExtractedEmail(response.data.email)
        setRegistrationStatus('extracting')
        
        // Register user with the extracted email
        try {
          const result = await registerWithEmail(response.data.email)
          
          if (result.userId) {
            setRegistrationStatus('success')
            // Wait a moment then redirect to verify email page
            setTimeout(() => navigate('/verify-email'), 2000)
          } else {
            setRegistrationStatus('existing')
            // Wait a moment then redirect to verify email page
            setTimeout(() => navigate('/verify-email'), 2000)
          }
        } catch (regError) {
          console.error('Registration error:', regError)
          setError(regError.message || 'Registration failed')
          setRegistrationStatus('failed')
        }
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.response?.data?.error || 'Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  const renderStatus = () => {
    if (uploading) {
      return (
        <div className="flex items-center justify-center space-x-2 text-blue-400">
          <FiLoader className="animate-spin" />
          <span>Processing your resume...</span>
        </div>
      )
    }
    
    if (registrationStatus === 'extracting') {
      return (
        <div className="flex items-center justify-center space-x-2 text-blue-400">
          <FiLoader className="animate-spin" />
          <span>Creating your account with email: {extractedEmail}</span>
        </div>
      )
    }
    
    if (registrationStatus === 'success') {
      return (
        <div className="flex items-center justify-center space-x-2 text-green-400">
          <FiCheck />
          <span>Success! Account created. Redirecting to verification page...</span>
        </div>
      )
    }
    
    if (registrationStatus === 'existing') {
      return (
        <div className="flex items-center justify-center space-x-2 text-yellow-400">
          <FiCheck />
          <span>Account already exists. Verification email sent. Redirecting...</span>
        </div>
      )
    }
    
    if (registrationStatus === 'failed') {
      return (
        <div className="flex items-center justify-center space-x-2 text-red-400">
          <FiXCircle />
          <span>Registration failed. Please try again.</span>
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
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-white">Upload Your Resume</h1>
              <p className="text-gray-300">
                We&apos;ll extract your email from your resume to get you started.
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
            
            {error && (
              <div className="mb-6 text-center">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}
            
            <div className="mb-6 text-center">
              {renderStatus()}
            </div>
            
            <div className="text-center">
              <button 
                onClick={handleUpload}
                disabled={!file || uploading || registrationStatus !== ''}
                className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 w-full ${
                  (!file || uploading || registrationStatus !== '') 
                    ? 'opacity-50 cursor-not-allowed hover:scale-100' 
                    : 'hover:shadow-xl hover:shadow-blue-500/25'
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <FiLoader className="animate-spin mr-2" />
                    Uploading...
                  </span>
                ) : (
                  'Upload Resume'
                )}
              </button>
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-400">
              <p>
                By uploading your resume, you agree to our{' '}
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