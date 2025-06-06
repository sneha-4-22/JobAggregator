import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { account } from '../appwrite' 
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
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi'
import { useUser } from '../context/UserContext'

function Settings() {
  const navigate = useNavigate()
  const { 
    current,
    hasResume, 
    userProfile,
    updateResumeData,
    logout
  } = useUser()

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    location: '',
    experience_level: 'entry',
    education: '',
    summary: '',
    phone: '',
    skills: [],
    projects: []
  })

  // Resume states
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeError, setResumeError] = useState('')
  const [resumeSuccess, setResumeSuccess] = useState('')

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
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // New skill input
  const [newSkill, setNewSkill] = useState('')
  const [newProject, setNewProject] = useState({
  name: '',
  description: '',
  technologies: '',
  duration: ''
})
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const isVerified = current?.emailVerification || false

  // Initialize profile form with current userProfile data
  // Complete useEffect replacement - put this in your component:

useEffect(() => {
  if (userProfile) {
    // Parse skills if they're stored as JSON string
    let skillsArray = []
    if (userProfile.skills) {
      if (Array.isArray(userProfile.skills)) {
        skillsArray = userProfile.skills
      } else if (typeof userProfile.skills === 'string') {
        try {
          skillsArray = JSON.parse(userProfile.skills)
        } catch {
          skillsArray = []
        }
      }
    }

    // Parse projects - handle pipe-separated JSON objects
    let projectsArray = []
    if (userProfile.projects && typeof userProfile.projects === 'string') {
      try {
        // Split by pipe separator and parse each JSON object
        const projectStrings = userProfile.projects.split(' | ')
        projectsArray = projectStrings.map(projectStr => {
          try {
            return JSON.parse(projectStr)
          } catch {
            // If JSON parsing fails, try manual parsing
            const nameMatch = projectStr.match(/"name":"([^"]+)"/)
            const descMatch = projectStr.match(/"description":"([^"]+)"/)
            const durationMatch = projectStr.match(/"duration":"([^"]+)"/)
            const techMatch = projectStr.match(/"technologies":\[([^\]]+)\]/)
            
            return {
              name: nameMatch ? nameMatch[1] : '',
              description: descMatch ? descMatch[1] : '',
              duration: durationMatch ? durationMatch[1] : '',
              technologies: techMatch ? 
                techMatch[1].split(',').map(tech => tech.replace(/["\s]/g, '')) : []
            }
          }
        })
      } catch (error) {
        console.error('Error parsing projects:', error)
        projectsArray = []
      }
    } else if (Array.isArray(userProfile.projects)) {
      projectsArray = userProfile.projects
    }

    setProfileForm({
      name: userProfile.name || '',
      location: userProfile.location || '',
      experience_level: userProfile.experience_level || 'entry',
      education: userProfile.education || '',
      summary: userProfile.summary || '',
      phone: userProfile.phone || '',
      skills: skillsArray,
      projects: projectsArray
    })
  }
}, [userProfile])

  const handleProfileSave = async () => {
  setProfileLoading(true)
  setProfileError('')
  setProfileSuccess('')
  
  try {
    // Ensure arrays are properly handled
    const ensureArray = (value) => {
      if (Array.isArray(value)) return value
      if (typeof value === 'string' && value.trim()) {
        try {
          return JSON.parse(value)
        } catch {
          return []
        }
      }
      return []
    }

    const updatedData = {
      name: profileForm.name,
      location_preference: profileForm.location,
      experience_level: profileForm.experience_level,
      education: profileForm.education,
      summary: profileForm.summary,
      phone: profileForm.phone,
      skills: ensureArray(profileForm.skills),
      // Fix: Ensure these are always arrays
      work_experience: ensureArray(userProfile?.work_experience),
      projects: ensureArray(userProfile?.projects),
      certifications: ensureArray(userProfile?.certifications),
      languages: ensureArray(userProfile?.languages),
      // Preserve other existing data
      originalFileName: userProfile?.originalFileName || null,
      resumeUploadedAt: userProfile?.resumeUploadedAt || null,
      resumeVersion: userProfile?.resumeVersion || 1,
      skillsCount: Array.isArray(profileForm.skills) ? profileForm.skills.length : 0,
      projectsCount: userProfile?.projectsCount || 0,
      completenessScore: userProfile?.completenessScore || 0,
      totalExperience: userProfile?.totalExperience || 0
    }
    
    await updateResumeData(null, updatedData)
    
    setIsEditingProfile(false)
    setProfileSuccess('Profile updated successfully!')
    setTimeout(() => setProfileSuccess(''), 3000)
  } catch (error) {
    console.error('Error updating profile:', error)
    setProfileError('Failed to update profile. Please try again.')
  } finally {
    setProfileLoading(false)
  }
}

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim()
    if (trimmedSkill && !profileForm.skills.includes(trimmedSkill)) {
      setProfileForm({
        ...profileForm,
        skills: [...profileForm.skills, trimmedSkill]
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
  const handleAddProject = () => {
  if (newProject.name.trim() && newProject.description.trim()) {
    const project = {
      name: newProject.name.trim(),
      description: newProject.description.trim(),
      technologies: newProject.technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
      duration: newProject.duration.trim() || 'Not specified'
    }
    
    setProfileForm({
      ...profileForm,
      projects: [...profileForm.projects, project]
    })
    
    setNewProject({
      name: '',
      description: '',
      technologies: '',
      duration: ''
    })
  }
}

const handleRemoveProject = (projectIndex) => {
  setProfileForm({
    ...profileForm,
    projects: profileForm.projects.filter((_, index) => index !== projectIndex)
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
    setResumeSuccess('')

    try {
      // Use your UserContext updateResumeData function with file
      await updateResumeData(file, null)
      setResumeSuccess('Resume updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setResumeSuccess(''), 3000)
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

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long')
      return
    }

    setPasswordLoading(true)
    setPasswordError('')
    setPasswordSuccess('')

    try {
      // Use Appwrite's updatePassword method
      await account.updatePassword(
        passwordForm.newPassword,
        passwordForm.currentPassword
      )
      
      setPasswordSuccess('Password changed successfully!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setIsChangingPassword(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(''), 3000)
    } catch (error) {
      console.error('Password change error:', error)
      if (error.message.includes('Invalid credentials')) {
        setPasswordError('Current password is incorrect')
      } else if (error.message.includes('Password must be')) {
        setPasswordError('Password must be at least 8 characters long')
      } else {
        setPasswordError('Failed to change password. Please try again.')
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteResume = async () => {
    if (window.confirm('Are you sure you want to delete your resume data? This action cannot be undone.')) {
      try {
        // Create empty data to clear resume information
        const emptyData = {
          name: '',
          location_preference: '',
          experience_level: 'entry',
          education: '',
          summary: '',
          phone: '',
          skills: [],
          work_experience: [],
          projects: [],
          certifications: [],
          languages: [],
          originalFileName: null,
          resumeUploadedAt: null,
          resumeVersion: 1,
          skillsCount: 0,
          projectsCount: 0,
          completenessScore: 0,
          totalExperience: 0
        }

        await updateResumeData(null, emptyData)
        alert('Resume data deleted successfully!')
        
        // Reload the page to reflect changes
        window.location.reload()
      } catch (error) {
        console.error('Error deleting resume:', error)
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

  // Get user stats for display
  const userStats = userProfile ? {
    skillsCount: userProfile.skillsCount || (Array.isArray(userProfile.skills) ? userProfile.skills.length : 0),
    projectsCount: userProfile.projectsCount || 0,
    completenessScore: userProfile.completenessScore || 0,
    experienceLevel: userProfile.experience_level || 'entry',
    totalExperience: userProfile.totalExperience || 0
  } : null

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
            {userStats && (
              <div className="text-right">
                <div className="text-sm text-gray-400">Profile Completeness</div>
                <div className="text-2xl font-bold text-green-400">{userStats.completenessScore}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {(profileSuccess || passwordSuccess) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg"
          >
            <div className="flex items-center">
              <FiCheckCircle className="mr-2 text-green-400" size={20} />
              <p className="text-green-300">{profileSuccess || passwordSuccess}</p>
            </div>
          </motion.div>
        )}

        {(profileError || passwordError) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-center">
              <FiAlertCircle className="mr-2 text-red-400" size={20} />
              <p className="text-red-300">{profileError || passwordError}</p>
            </div>
          </motion.div>
        )}

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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      placeholder="Enter your phone number"
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
                    <textarea
                      value={profileForm.education}
                      onChange={(e) => setProfileForm({ ...profileForm, education: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      placeholder="e.g., Bachelor's in Computer Science from XYZ University"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location Preference</label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      placeholder="e.g., Remote, San Francisco, New York"
                    />
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Professional Summary</label>
                    <textarea
                      value={profileForm.summary}
                      onChange={(e) => setProfileForm({ ...profileForm, summary: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      placeholder="Brief summary of your professional background and goals"
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
                  {/* Projects */}
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">Projects</label>
  <div className="space-y-3 mb-4">
    {profileForm.projects.map((project, index) => (
      <div key={index} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-white">{project.name}</h4>
            <p className="text-gray-300 text-sm mt-1">{project.description}</p>
            {project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.technologies.map((tech, techIndex) => (
                  <span key={techIndex} className="bg-blue-900/50 text-blue-200 px-2 py-1 rounded text-xs border border-blue-500/30">
                    {tech}
                  </span>
                ))}
              </div>
            )}
            <p className="text-gray-400 text-xs mt-2">{project.duration}</p>
          </div>
          <button
            onClick={() => handleRemoveProject(index)}
            className="ml-3 text-red-400 hover:text-red-300 transition-colors"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    ))}
  </div>
  
  <div className="space-y-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
    <div>
      <input
        type="text"
        value={newProject.name}
        onChange={(e) => setNewProject({...newProject, name: e.target.value})}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm"
        placeholder="Project name"
      />
    </div>
    <div>
      <textarea
        value={newProject.description}
        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
        rows={2}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm"
        placeholder="Project description"
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <input
        type="text"
        value={newProject.technologies}
        onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm"
        placeholder="Technologies (comma-separated)"
      />
      <input
        type="text"
        value={newProject.duration}
        onChange={(e) => setNewProject({...newProject, duration: e.target.value})}
        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm"
        placeholder="Duration (e.g., Ongoing, 3 months)"
      />
    </div>
    <button
      onClick={handleAddProject}
      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
    >
      <FiCheck className="inline mr-2" size={14} />
      Add Project
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
                      onClick={() => {
                        setIsEditingProfile(false)
                        setProfileError('')
                      }}
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
                    <p className="font-medium text-white">{userProfile?.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <FiBriefcase className="mr-2 text-gray-400" size={16} />
                      <span className="text-sm text-gray-400">Experience Level</span>
                    </div>
                    <p className="font-medium capitalize text-white">{userProfile?.experience_level || 'Entry'}</p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <FiBook className="mr-2 text-gray-400" size={16} />
                      <span className="text-sm text-gray-400">Education</span>
                    </div>
                    <p className="font-medium text-white">{userProfile?.education ? (userProfile.education.length > 100 ? userProfile.education.substring(0, 100) + '...' : userProfile.education) : 'Not specified'}</p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <FiMapPin className="mr-2 text-gray-400" size={16} />
                      <span className="text-sm text-gray-400">Location</span>
                    </div>
                    <p className="font-medium text-white">{userProfile?.location || 'Flexible'}</p>
                  </div>
                </div>
              )
            ) : (
              <div className="text-gray-400 text-center py-8">
                <FiUser size={48} className="mx-auto mb-4 opacity-50" />
                <p>No profile data available. Upload your resume to get started.</p>
              </div>
            )}

            {hasResume && userProfile?.skills && Array.isArray(userProfile.skills) && userProfile.skills.length > 0 && !isEditingProfile && (
              <div className="mt-6">
                <div className="flex items-center mb-3">
                  <span className="text-sm text-gray-400">Skills ({userProfile.skills.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills.slice(0, 20).map((skill, index) => (
                    <span key={index} className="bg-blue-900/50 text-blue-200 px-3 py-1 rounded-md text-sm border border-blue-500/30">
                      {skill}
                    </span>
                  ))}
                  {userProfile.skills.length > 20 && (
                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-md text-sm">
                      +{userProfile.skills.length - 20} more
                    </span>
                  )}
                </div>
              </div>
            )}
{hasResume && userProfile?.projects && Array.isArray(userProfile.projects) && userProfile.projects.length > 0 && !isEditingProfile && (
  <div className="mt-6">
    <div className="flex items-center mb-3">
      <span className="text-sm text-gray-400">Projects ({userProfile.projects.length})</span>
    </div>
    <div className="space-y-3">
      {userProfile.projects.slice(0, 3).map((project, index) => (
        <div key={index} className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
          <h4 className="font-medium text-white text-sm">{project.name}</h4>
          <p className="text-gray-300 text-xs mt-1 leading-relaxed">
            {project.description.length > 100 ? project.description.substring(0, 100) + '...' : project.description}
          </p>
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {project.technologies.slice(0, 5).map((tech, techIndex) => (
                <span key={techIndex} className="bg-blue-900/50 text-blue-200 px-2 py-1 rounded text-xs border border-blue-500/30">
                  {tech}
                </span>
              ))}
              {project.technologies.length > 5 && (
                <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs">
                  +{project.technologies.length - 5}
                </span>
              )}
            </div>
          )}
          <p className="text-gray-400 text-xs mt-2">{project.duration}</p>
        </div>
      ))}
      {userProfile.projects.length > 3 && (
        <div className="text-center">
          <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-md text-xs">
            +{userProfile.projects.length - 3} more projects
          </span>
        </div>
      )}
    </div>
  </div>
)}
            {hasResume && userProfile?.summary && !isEditingProfile && (
              <div className="mt-6">
                <div className="flex items-center mb-3">
                  <span className="text-sm text-gray-400">Professional Summary</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {userProfile.summary.length > 300 ? userProfile.summary.substring(0, 300) + '...' : userProfile.summary}
                </p>
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
                      File: {userProfile?.originalFileName || 'resume.pdf'}
                    </p>
                    <p className="text-green-200 text-sm">
                      Last updated: {userProfile?.resumeUploadedAt ? new Date(userProfile.resumeUploadedAt).toLocaleDateString() : 'Unknown'}
                    </p>
                    <p className="text-green-200 text-sm">
                      Version: {userProfile?.resumeVersion || 1}
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

            {resumeSuccess && (
              <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center">
                  <FiCheckCircle className="mr-2 text-green-400" size={16} />
                  <p className="text-green-300 text-sm">{resumeSuccess}</p>
                </div>
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPasswords.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

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
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      })
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
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Password</p>
                    <p className="text-gray-400 text-sm">••••••••••••</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center ${isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                      {isVerified ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
                      <span className="ml-2 text-sm">
                        {isVerified ? 'Email Verified' : 'Email Not Verified'}
                      </span>
                    </div>
                  </div>
                </div>
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
            <div className="flex items-center mb-6">
              <FiSettings className="mr-3 text-red-400" size={24} />
              <h2 className="text-xl font-semibold text-white">Account Actions</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                <div>
                  <p className="text-red-300 font-medium">Sign Out</p>
                  <p className="text-red-200 text-sm">Sign out from your account</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>

          {/* User Stats - if available */}
          {userStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700"
            >
              <div className="flex items-center mb-6">
                <FiUser className="mr-3 text-purple-400" size={24} />
                <h2 className="text-xl font-semibold text-white">Profile Statistics</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{userStats.skillsCount}</div>
                  <div className="text-sm text-gray-400">Skills</div>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{userStats.projectsCount}</div>
                  <div className="text-sm text-gray-400">Projects</div>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{userStats.completenessScore}%</div>
                  <div className="text-sm text-gray-400">Complete</div>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400 capitalize">{userStats.experienceLevel}</div>
                  <div className="text-sm text-gray-400">Level</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings