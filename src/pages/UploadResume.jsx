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
        <div className="flex items-center space-x-2 text-primary-600">
          <FiLoader className="animate-spin" />
          <span>Processing your resume...</span>
        </div>
      )
    }
    
    if (registrationStatus === 'extracting') {
      return (
        <div className="flex items-center space-x-2 text-primary-600">
          <FiLoader className="animate-spin" />
          <span>Creating your account with email: {extractedEmail}</span>
        </div>
      )
    }
    
    if (registrationStatus === 'success') {
      return (
        <div className="flex items-center space-x-2 text-success-600">
          <FiCheck />
          <span>Success! Account created. Redirecting to verification page...</span>
        </div>
      )
    }
    
    if (registrationStatus === 'existing') {
      return (
        <div className="flex items-center space-x-2 text-warning-600">
          <FiCheck />
          <span>Account already exists. Verification email sent. Redirecting...</span>
        </div>
      )
    }
    
    if (registrationStatus === 'failed') {
      return (
        <div className="flex items-center space-x-2 text-error-600">
          <FiXCircle />
          <span>Registration failed. Please try again.</span>
        </div>
      )
    }
    
    return null
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
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-gray-800">Upload Your Resume</h1>
              <p className="text-gray-600">
                We'll extract your email from your resume to get you started.
              </p>
            </div>
            
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 mb-6 transition-colors text-center cursor-pointer
                ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center">
                {file ? (
                  <>
                    <FiFile className="text-primary-500 mb-2\" size={40} />
                    <p className="text-primary-600 font-medium">{file.name}</p>
                    <p className="text-gray-500 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <FiUpload className="text-gray-400 mb-2" size={40} />
                    <p className="text-gray-700 font-medium">
                      Drag & drop your resume here
                    </p>
                    <p className="text-gray-500 text-sm">
                      (PDF file only, max 5MB)
                    </p>
                  </>
                )}
              </div>
            </div>
            
            {error && (
              <div className="mb-6 text-center text-error-600">
                {error}
              </div>
            )}
            
            <div className="mb-6 text-center">
              {renderStatus()}
            </div>
            
            <div className="text-center">
              <button 
                onClick={handleUpload}
                disabled={!file || uploading || registrationStatus !== ''}
                className={`btn-primary w-full ${
                  (!file || uploading || registrationStatus !== '') 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
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
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                By uploading your resume, you agree to our{' '}
                <a href="#" className="text-primary-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:underline">
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