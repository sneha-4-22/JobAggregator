import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiUser, 
  FiUpload, 
  FiKey, 
  FiSave, 
  FiTrash2, 
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiEdit3,
  FiCheck,
  FiX,
  FiLoader,
  FiMapPin,
  FiBook,
  FiBriefcase,
  FiSettings,
  FiAlertCircle
} from 'react-icons/fi'
import { useUser } from '../context/UserContext'

function Settings() {
  const navigate = useNavigate()
  const { 
    hasResume, 
    resumeData, 
    updateResumeData, 
    clearResumeData,
    logout
  } = useUser()

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    location_preference: '',
    experience_level: '',
    education: '',
    skills: []
  })

  // Resume states
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeError, setResumeError] = useState('')

  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // New skill input
  const [newSkill, setNewSkill] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  const API_BASE_URL = 'http://127.0.0.1:5000'

  // Initialize profile form with current data
  useEffect(() => {
    if (resumeData) {
      setProfileForm({
        name: resumeData.name || '',
        location_preference: resumeData.location_preference || '',
        experience_level: resumeData.experience_level || 'entry',
        education: resumeData.education || '',
        skills: resumeData.skills || []
      })
    }
  }, [resumeData])

  const handleProfileSave = async () => {
    setProfileLoading(true)
    try {
      // Update resume data with new profile information
      const updatedData = {
        ...resumeData,
        ...profileForm,
        updatedAt: new Date().toISOString()
      }
      
      await updateResumeData(updatedData)
      setIsEditingProfile(false)
      
      // Show success message
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileForm.skills.includes(newSkill.trim())) {
      setProfileForm({
        ...profileForm,
        skills: [...profileForm.skills, newSkill.trim()]
      })
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setProfileForm({
      ...profileForm,
      skills: profileForm.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setResumeError('Please upload a PDF file')
      return
    }

    setUploadingResume(true)
    setResumeError('')
    const formData = new FormData()
    formData.append('resume', file)

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-resume`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.text()
          if (errorData) {
            try {
              const parsedError = JSON.parse(errorData)
              errorMessage = parsedError.error || errorMessage
            } catch {
              errorMessage = errorData
            }
          }
        } catch {
          // Ignore parsing errors, use default message
        }
        throw new Error(errorMessage)
      }
      
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server did not return JSON response")
      }
      
      const data = await response.json()
      
      if (data.success) {
        await updateResumeData(data.analysis)
        alert('Resume updated successfully!')
      } else {
        setResumeError('Error analyzing resume: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      setResumeError('Error uploading resume: ' + error.message)
    } finally {
      setUploadingResume(false)
      event.target.value = ''
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long')
      return
    }

    setPasswordLoading(true)
    setPasswordError('')

    try {
      // This would be your actual password change API call
      // const response = await fetch(`${API_BASE_URL}/api/change-password`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     currentPassword: passwordForm.currentPassword,
      //     newPassword: passwordForm.newPassword
      //   })
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Password changed successfully!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setIsChangingPassword(false)
    } catch {
      setPasswordError('Failed to change password. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteResume = async () => {
    if (window.confirm('Are you sure you want to delete your resume data? This action cannot be undone.')) {
      try {
        await clearResumeData()
        alert('Resume data deleted successfully!')
      } catch {
        alert('Failed to delete resume data. Please try again.')
      }
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout()
      navigate('/')
    }
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
              >
                <FiArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <FiSettings className="mr-3" />
                  Settings
                </h1>
                <p className="text-gray-300 mt-1">Manage your profile and account preferences</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FiUser className="mr-3 text-blue-400" size={24} />
                <h2 className="text-xl font-semibold text-white">Profile Information</h2>
              </div>
              {hasResume && !isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FiEdit3 className="mr-2" size={16} />
                  Edit Profile
                </button>
              )}
            </div>

            {hasResume ? (
              isEditingProfile ? (
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
                    <select
                      value={profileForm.experience_level}
                      onChange={(e) => setProfileForm({ ...profileForm, experience_level: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    >
                      <option value="entry">Entry Level</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>

                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Education</label>
                    <input
                      type="text"
                      value={profileForm.education}
                      onChange={(e) => setProfileForm({ ...profileForm, education: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      placeholder="e.g., Bachelor's in Computer Science"
                    />
                  </div>

                  {/* Location Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location Preference</label>
                    <input
                      type="text"
                      value={profileForm.location_preference}
                      onChange={(e) => setProfileForm({ ...profileForm, location_preference: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      placeholder="e.g., Remote, San Francisco, New York"
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profileForm.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="flex items-center bg-blue-900/50 text-blue-200 px-3 py-1 rounded-md text-sm border border-blue-500/30"
                        >
                          {skill}
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 text-blue-300 hover:text-red-300 transition-colors"
                          >
                            <FiX size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        placeholder="Add a skill"
                      />
                      <button
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <FiCheck size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleProfileSave}
                      disabled={profileLoading}
                      className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors"
                    >
                      {profileLoading ? <FiLoader className="mr-2 animate-spin" size={16} /> : <FiSave className="mr-2" size={16} />}
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="flex items-center px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <FiX className="mr-2" size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <FiUser className="mr-2 text-gray-400" size={16} />
                      <span className="text-sm text-gray-400">Name</span>
                    </div>
                    <p className="font-medium text-white">{resumeData.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <FiBriefcase className="mr-2 text-gray-400" size={16} />
                      <span className="text-sm text-gray-400">Experience Level</span>
                    </div>
                    <p className="font-medium capitalize text-white">{resumeData.experience_level || 'Entry'}</p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <FiBook className="mr-2 text-gray-400" size={16} />
                      <span className="text-sm text-gray-400">Education</span>
                    </div>
                    <p className="font-medium text-white">{resumeData.education || 'Not specified'}</p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <FiMapPin className="mr-2 text-gray-400" size={16} />
                      <span className="text-sm text-gray-400">Location Preference</span>
                    </div>
                    <p className="font-medium text-white">{resumeData.location_preference || 'Flexible'}</p>
                  </div>
                </div>
              )
            ) : (
              <div className="text-gray-400 text-center py-8">
                <FiUser size={48} className="mx-auto mb-4 opacity-50" />
                <p>No profile data available. Upload your resume to get started.</p>
              </div>
            )}

            {hasResume && resumeData.skills && resumeData.skills.length > 0 && !isEditingProfile && (
              <div className="mt-6">
                <div className="flex items-center mb-3">
                  <span className="text-sm text-gray-400">Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-900/50 text-blue-200 px-3 py-1 rounded-md text-sm border border-blue-500/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Resume Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700"
          >
            <div className="flex items-center mb-6">
              <FiUpload className="mr-3 text-green-400" size={24} />
              <h2 className="text-xl font-semibold text-white">Resume Management</h2>
            </div>

            {hasResume ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                  <div>
                    <p className="text-green-300 font-medium">Resume Uploaded</p>
                    <p className="text-green-200 text-sm">
                      Last updated: {resumeData.updatedAt ? new Date(resumeData.updatedAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <FiCheck className="text-green-400" size={24} />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer">
                    <FiUpload className="mr-2" />
                    {uploadingResume ? 'Updating Resume...' : 'Update Resume'}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    onClick={handleDeleteResume}
                    className="flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <FiTrash2 className="mr-2" />
                    Delete Resume
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <FiUpload size={48} className="mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-300 mb-4">Upload your resume to get personalized job recommendations</p>
                </div>
                <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 cursor-pointer">
                  <FiUpload className="mr-2" />
                  {uploadingResume ? 'Analyzing Resume...' : 'Upload Resume (PDF)'}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {resumeError && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center">
                  <FiAlertCircle className="mr-2 text-red-400" size={16} />
                  <p className="text-red-300 text-sm">{resumeError}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Password Change */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FiKey className="mr-3 text-yellow-400" size={24} />
                <h2 className="text-xl font-semibold text-white">Password & Security</h2>
              </div>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  <FiKey className="mr-2" size={16} />
                  Change Password
                </button>
              )}
            </div>

            {isChangingPassword ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-12 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.current ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-12 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-12 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-center">
                      <FiAlertCircle className="mr-2 text-red-400" size={16} />
                      <p className="text-red-300 text-sm">{passwordError}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handlePasswordChange}
                    disabled={passwordLoading}
                    className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors"
                  >
                    {passwordLoading ? <FiLoader className="mr-2 animate-spin" size={16} /> : <FiSave className="mr-2" size={16} />}
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    onClick={() => {
                      setIsChangingPassword(false)
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      setPasswordError('')
                    }}
                    className="flex items-center px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <FiX className="mr-2" size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">
                <p>Keep your account secure by using a strong password.</p>
                <p className="text-sm mt-2">Last password change: Never</p>
              </div>
            )}
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Account Actions</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <FiArrowLeft className="mr-2" />
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Settings