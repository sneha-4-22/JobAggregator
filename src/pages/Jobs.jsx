import { useEffect, useState } from 'react'
import { FiBookmark, FiBriefcase, FiCheckCircle, FiClock, FiEdit, FiExternalLink, FiFilter, FiMapPin, FiSearch, FiSettings, FiUpload, FiUser } from 'react-icons/fi'
import { useUser } from '../context/UserContext'
import BugReportButton from './BugReportButton'

function Jobs() {
  const [jobs, setJobs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedJobs, setSavedJobs] = useState([])
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false)
  const [filters, setFilters] = useState({
    jobType: 'internship',
    location: 'all'
  })
  const [profileExpanded, setProfileExpanded] = useState(false)

  const { 
    current: user, 
    hasResume, 
    userProfile, 
    updateResumeData,
    getUserStats
  } = useUser()

  const API_BASE_URL = 'https://gigi-back.onrender.com'
  const rec_API_BASE_URL = 'https://job-recommendation-api-jh7p.onrender.com'

  const userStats = getUserStats()

  useEffect(() => {
    if (hasResume && userProfile) {
      fetchPersonalizedJobs()
    } else {
      fetchDefaultJobs()
    }
  }, [hasResume, userProfile, filters])
  


  const fetchDefaultJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        location: filters.location === 'all' ? 'flexible' : filters.location,
        type: filters.jobType
      })
      
      const response = await fetch(`${API_BASE_URL}/api/search-jobs?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }
      
      const data = await response.json()
      
      if (data.success) {
        setJobs(data.jobs)
      } else {
        console.error('Error fetching jobs:', data.error)
        setJobs([])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPersonalizedJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${rec_API_BASE_URL}/api/get-personalized-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: userProfile?.skills || [],
          location: filters.location === 'all' ? userProfile?.location || 'flexible' : filters.location,
          job_type: filters.jobType,
          experience_level: userProfile?.experience_level || 'entry'
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }
      
      const data = await response.json()
      
      if (data.success) {
        setJobs(data.jobs)
      } else {
        console.error('Error fetching personalized jobs:', data.error)
        setJobs([])
      }
    } catch (error) {
      console.error('Error fetching personalized jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file')
      return
    }

    setResumeAnalyzing(true)

    try {
      // Use the updateResumeData function from context
      await updateResumeData(file)
      alert('Resume analyzed successfully! Getting personalized job recommendations...')
    } catch (error) {
      console.error('Error uploading resume:', error)
      alert('Error uploading resume: ' + error.message)
    } finally {
      setResumeAnalyzing(false)
      event.target.value = ''
    }
  }

  const toggleSaveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId))
    } else {
      setSavedJobs([...savedJobs, jobId])
    }
  }

  const filterJobs = () => {
    let filteredJobs = [...jobs]
    
    if (searchTerm) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    }
    
    return filteredJobs
  }

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    })
  }

  const handleSearch = () => {
    if (hasResume && userProfile) {
      fetchPersonalizedJobs()
    } else {
      fetchDefaultJobs()
    }
  }

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`)
        if (response.ok) {
          console.log('API connection successful')
        } else {
          console.warn('API connection failed - check if Flask server is running')
        }
      } catch {
        console.warn('Cannot connect to Flask server - make sure it\'s running on https://gigi-back.onrender.com')
      }
    }
    testConnection()
  }, [])

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {hasResume ? `Welcome back, ${userProfile?.name || user?.name || 'User'}!` : 'Job & Internship Dashboard'}
              </h1>
              <p className="text-gray-300">
                {hasResume 
                  ? 'Here are personalized job and internship recommendations based on your resume.'
                  : 'Upload your resume to get personalized job recommendations, or browse available opportunities.'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {hasResume && (
                <button 
                  onClick={() => window.location.href = '/profile'}
                  className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors border border-gray-600"
                >
                  <FiSettings className="mr-2" />
                  Profile
                </button>
              )}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            API Status: <span className="font-medium text-blue-400">Connected to {API_BASE_URL}</span>
          </div>
        </div>

        {/* Profile Completeness Banner */}
        {hasResume && userProfile && (
          <div className="mb-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Profile Status</h3>
                <p className="text-blue-200">
                  Your profile is {userProfile.completenessScore || 0}% complete
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{userStats?.skillsCount || 0}</div>
                  <div className="text-sm text-gray-300">Skills</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{userStats?.workExperienceCount || 0}</div>
                  <div className="text-sm text-gray-300">Experience</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{userStats?.projectsCount || 0}</div>
                  <div className="text-sm text-gray-300">Projects</div>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${userProfile.completenessScore || 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {!hasResume && (
          <div className="mb-8 bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-dashed border-blue-500/50 hover:border-blue-400 transition-colors">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                <FiUpload size={24} />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Upload Your Resume for Personalized Recommendations
              </h3>
              <p className="text-gray-300 mb-4">
                Get job recommendations tailored to your skills and experience
              </p>
              <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <FiUpload className="mr-2" />
                {resumeAnalyzing ? 'Analyzing Resume...' : 'Upload Resume (PDF)'}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  disabled={resumeAnalyzing}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

{hasResume && userProfile && (
  <div className="mb-8 bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <FiUser className="mr-2 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Your Profile</h3>
      </div>
      <div className="flex items-center space-x-4">
        {/* Collapsible toggle button */}
        <button 
          onClick={() => setProfileExpanded(!profileExpanded)}
          className="flex items-center text-sm text-gray-400 hover:text-blue-400 transition-colors"
        >
          {profileExpanded ? 'Show Less' : 'Show More'}
        </button>
        <button 
          onClick={() => window.location.href = '/profile'}
          className="flex items-center text-sm text-gray-400 hover:text-blue-400 transition-colors"
        >
          <FiEdit className="mr-1" />
          Edit Profile
        </button>
      </div>
    </div>

    {/* Compact Profile Summary - Always Visible */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div className="text-center p-3 bg-gray-700/30 rounded-lg">
        <div className="text-xl font-bold text-white">{userProfile.skills?.length || 0}</div>
        <div className="text-xs text-gray-400">Skills</div>
      </div>
      <div className="text-center p-3 bg-gray-700/30 rounded-lg">
        <div className="text-xl font-bold text-white">{userStats?.workExperienceCount || 0}</div>
        <div className="text-xs text-gray-400">Experience</div>
      </div>
      <div className="text-center p-3 bg-gray-700/30 rounded-lg">
        <div className="text-xl font-bold text-white">{userStats?.projectsCount || 0}</div>
        <div className="text-xs text-gray-400">Projects</div>
      </div>
      <div className="text-center p-3 bg-gray-700/30 rounded-lg">
        <div className="text-xl font-bold text-white">{userProfile.completenessScore || 0}%</div>
        <div className="text-xs text-gray-400">Complete</div>
      </div>
    </div>

    {/* Top Skills Preview - Always Visible */}
    {userProfile.skills && userProfile.skills.length > 0 && (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Top Skills</span>
          <span className="text-xs text-gray-500">{userProfile.skills.length} total</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {userProfile.skills.slice(0, 6).map((skill, index) => (
            <span key={index} className="bg-blue-900/50 text-blue-200 px-2 py-1 rounded text-sm border border-blue-500/30">
              {skill}
            </span>
          ))}
          {userProfile.skills.length > 6 && (
            <span className="text-gray-400 text-sm px-2 py-1">
              +{userProfile.skills.length - 6} more
            </span>
          )}
        </div>
      </div>
    )}

    {/* Expandable Details Section */}
    {profileExpanded && (
      <div className="border-t border-gray-600 pt-4 space-y-4 animate-fadeIn">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400">Name</p>
            <p className="font-medium text-white text-sm">{userProfile.name || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Experience Level</p>
            <p className="font-medium capitalize text-white text-sm">{userProfile.experience_level || 'Entry'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Location</p>
            <p className="font-medium text-white text-sm">{userProfile.location || 'Flexible'}</p>
          </div>
        </div>

        {/* All Skills */}
        {userProfile.skills && userProfile.skills.length > 6 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">All Skills</p>
            <div className="flex flex-wrap gap-2">
              {userProfile.skills.map((skill, index) => (
                <span key={index} className="bg-blue-900/50 text-blue-200 px-2 py-1 rounded text-sm border border-blue-500/30">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section - Compact Horizontal Cards */}
        {(() => {
          let projectsArray = [];
          if (userProfile.projects && typeof userProfile.projects === 'string') {
            try {
              const projectStrings = userProfile.projects.split(' | ');
              projectsArray = projectStrings.map(projectStr => {
                const match = projectStr.match(/\{(.+)\}/);
                if (match) {
                  try {
                    return JSON.parse('{' + match[1] + '}');
                  } catch {
                    return null;
                  }
                }
                return null;
              }).filter(project => project !== null);
            } catch (e) {
              console.error('Error parsing projects string:', e);
            }
          } else if (Array.isArray(userProfile.projects)) {
            projectsArray = userProfile.projects;
          }

          return projectsArray.length > 0 ? (
            <div>
              <p className="text-sm text-gray-400 mb-3">Recent Projects</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectsArray.slice(0, 4).map((project, index) => (
                  <div key={index} className="bg-gray-700/30 border border-gray-600 rounded-lg p-3">
                    <h4 className="font-medium text-white text-sm mb-1">{project.name || 'Untitled Project'}</h4>
                    <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                      {project.description && project.description.length > 80 
                        ? project.description.substring(0, 80) + '...' 
                        : project.description || 'No description available'
                      }
                    </p>
                    {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, techIndex) => (
                          <span key={techIndex} className="bg-blue-900/50 text-blue-200 px-1.5 py-0.5 rounded text-xs border border-blue-500/30">
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="text-gray-400 text-xs">+{project.technologies.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {projectsArray.length > 4 && (
                <div className="text-center mt-2">
                  <span className="text-gray-400 text-xs">
                    +{projectsArray.length - 4} more projects in full profile
                  </span>
                </div>
              )}
            </div>
          ) : null;
        })()}

        {/* Professional Summary - Truncated */}
        {userProfile.summary && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Professional Summary</p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {userProfile.summary.length > 150 
                ? userProfile.summary.substring(0, 150) + '...' 
                : userProfile.summary
              }
            </p>
          </div>
        )}

        {/* Resume Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700">
          <div>
            Resume: {userProfile.originalFileName || 'Uploaded'}
          </div>
          <div>
            Updated: {userProfile.resumeUploadedAt ? new Date(userProfile.resumeUploadedAt).toLocaleDateString() : 'Unknown'}
          </div>
        </div>
      </div>
    )}
  </div>
)}
        {/* Search and Filters */}
        <div className="mb-8 bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills"
                className="pl-10 w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1">Job Type</label>
                <select 
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                >
                  <option value="internship">Internship</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                </select>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                <select 
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                >
                  <option value="all">All Locations</option>
                  <option value="remote">Remote</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="New York">New York</option>
                  <option value="Austin">Austin</option>
                  <option value="Boston">Boston</option>
                  <option value="Seattle">Seattle</option>
                </select>
              </div>
              
              <button 
                onClick={handleSearch}
                className="h-10 self-end flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300"
                disabled={loading}
              >
                <FiFilter className="mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">
              {hasResume ? 'Recommended for You' : 'Available Opportunities'}
            </h2>
            {jobs.length > 0 && (
              <p className="text-gray-300">{filterJobs().length} jobs found</p>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filterJobs().length > 0 ? (
                filterJobs().map(job => (
                  <div 
                    key={job.id}
                    className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-blue-500/50 group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center">
                      {/* Company Logo */}
                      <div className="mb-4 md:mb-0 md:mr-6">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0 border border-gray-600">
                          <img 
                            src={job.logo} 
                            alt={`${job.company} logo`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          <div className="w-full h-full bg-gray-600 flex items-center justify-center text-gray-400 text-xs" style={{display: 'none'}}>
                            No Logo
                          </div>
                        </div>
                      </div>
                      
                      {/* Job Details */}
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">{job.title}</h3>
                            <div className="flex items-center gap-4 text-gray-300 mb-2">
                              <div className="flex items-center">
                                <FiBriefcase className="mr-1" size={14} />
                                <span>{job.company}</span>
                              </div>
                              <div className="flex items-center">
                                <FiMapPin className="mr-1" size={14} />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center">
                                <FiClock className="mr-1" size={14} />
                                <span>Posted {job.posted}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium 
                              ${job.type === 'Internship' 
                                ? 'bg-green-900/50 text-green-300 border border-green-500/30' 
                                : 'bg-blue-900/50 text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              {job.type}
                            </span>
                            {job.source && (
                              <span className="inline-block px-2 py-1 rounded-md text-xs bg-gray-700 text-gray-300 border border-gray-600">
                                {job.source}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 mb-4 line-clamp-2">
                          {job.description}
                        </p>
                        
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.slice(0, 6).map((skill, index) => (
                              <span 
                                key={index} 
                                className="bg-gray-700 text-gray-200 px-2 py-1 rounded-md text-xs border border-gray-600"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 6 && (
                              <span className="text-gray-400 text-xs">
                                +{job.skills.length - 6} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div className="text-blue-400 font-semibold mb-2 sm:mb-0">
                            {job.salary}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button 
                              className={`p-2 rounded-full transition-colors ${
                                savedJobs.includes(job.id) 
                                  ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30'
                                  : 'bg-gray-700 text-gray-400 hover:bg-blue-900/30 hover:text-blue-400 border border-gray-600'
                              }`}
                              onClick={() => toggleSaveJob(job.id)}
                              aria-label={savedJobs.includes(job.id) ? "Unsave job" : "Save job"}
                            >
                              {savedJobs.includes(job.id) ? <FiCheckCircle size={20} /> : <FiBookmark size={20} />}
                            </button>
                            
                            {job.apply_link && job.apply_link !== '#' ? (
                              <a
                                href={job.apply_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                              >
                                Apply Now
                                <FiExternalLink className="ml-2" size={16} />
                              </a>
                            ) : (
                              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105">
                                Apply Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                  <div className="text-gray-400 mb-4">
                    <FiSearch size={48} className="mx-auto" />
                  </div>
                  <p className="text-gray-300 mb-4">
                    {loading ? 'Loading jobs...' : 'No job listings match your search criteria.'}
                  </p>
                  {!loading && (
                    <button 
                      className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
                      onClick={() => {
                        setSearchTerm('')
                        setFilters({ jobType: 'internship', location: 'all' })
                        setTimeout(() => {
                          if (hasResume && userProfile) {
                            fetchPersonalizedJobs()
                          } else {
                            fetchDefaultJobs()
                          }
                        }, 100)
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tips Section */}
        {hasResume && userProfile && (
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              💡 Job Search Tips Based on Your Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                <h4 className="font-medium text-blue-300 mb-2">Profile Optimization</h4>
                <p className="text-blue-200 text-sm">
                  {userProfile.completenessScore < 80 
                    ? "Complete your profile to increase visibility to recruiters. Add more skills and work experience."
                    : "Your profile looks great! Keep it updated with your latest achievements and skills."
                  }
                </p>
              </div>
              <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                <h4 className="font-medium text-green-300 mb-2">Application Tips</h4>
                <p className="text-green-200 text-sm">
                  {userProfile.experience_level === 'entry' 
                    ? "Focus on internships and entry-level positions. Highlight your projects and academic achievements."
                    : "Leverage your experience! Apply to positions that match your skill level and career goals."
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <BugReportButton 
  userEmail={user?.email || ''} 
  userName={user?.name || ''} 
/>
    </div>
  )
}

export default Jobs