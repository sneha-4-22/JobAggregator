import { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiMapPin, FiBriefcase, FiClock, FiBookmark, FiCheckCircle, FiUpload, FiUser, FiExternalLink } from 'react-icons/fi'

function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedJobs, setSavedJobs] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false)
  const [filters, setFilters] = useState({
    jobType: 'internship',
    location: 'all'
  })

  // Configure API base URL - change this to match your Flask server
  const API_BASE_URL = 'http://127.0.0.1:5000'

  // Load initial jobs
  useEffect(() => {
    if (userProfile) {
      fetchPersonalizedJobs()
    } else {
      fetchDefaultJobs()
    }
  }, [userProfile, filters])

  const fetchDefaultJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        location: filters.location === 'all' ? 'flexible' : filters.location,
        type: filters.jobType
      })
      
      const response = await fetch(`${API_BASE_URL}/api/search-jobs?${params}`)
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Check if response has content
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
      const response = await fetch(`${API_BASE_URL}/api/get-personalized-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: userProfile.skills || [],
          location: filters.location === 'all' ? userProfile.location_preference : filters.location,
          job_type: filters.jobType,
          experience_level: userProfile.experience_level || 'entry'
        })
      })
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Check if response has content
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
    const formData = new FormData()
    formData.append('resume', file)

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-resume`, {
        method: 'POST',
        body: formData
      })
      
      // First check if the response is ok
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Server error: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.text() // Use text() instead of json() for error responses
          if (errorData) {
            try {
              const parsedError = JSON.parse(errorData)
              errorMessage = parsedError.error || errorMessage
            } catch {
              // If not JSON, use the text as is
              errorMessage = errorData
            }
          }
        } catch {
          // Ignore parsing errors, use default message
        }
        throw new Error(errorMessage)
      }
      
      // Check content type before parsing as JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server did not return JSON response")
      }
      
      const data = await response.json()
      
      if (data.success) {
        setUserProfile(data.analysis)
        alert('Resume analyzed successfully! Getting personalized job recommendations...')
      } else {
        alert('Error analyzing resume: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      alert('Error uploading resume: ' + error.message)
    } finally {
      setResumeAnalyzing(false)
      // Clear the file input
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
    if (userProfile) {
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
        console.warn('Cannot connect to Flask server - make sure it\'s running on http://127.0.0.1:5000')
      }
    }
    testConnection()
  }, [])

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {userProfile ? `Welcome, ${userProfile.name || 'User'}!` : 'Job & Internship Dashboard'}
          </h1>
          <p className="text-gray-600">
            {userProfile 
              ? 'Here are personalized job and internship recommendations based on your resume.'
              : 'Upload your resume to get personalized job recommendations, or browse available opportunities.'
            }
          </p>
          <div className="mt-2 text-sm text-gray-500">
            API Status: <span className="font-medium">Connected to {API_BASE_URL}</span>
          </div>
        </div>

        {/* Resume Upload Section */}
        {!userProfile && (
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-blue-300">
            <div className="text-center">
              <FiUpload className="mx-auto h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Your Resume for Personalized Recommendations
              </h3>
              <p className="text-gray-600 mb-4">
                Get job recommendations tailored to your skills and experience
              </p>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
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

        {/* User Profile Section */}
        {userProfile && (
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <FiUser className="mr-2 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Your Profile</h3>
              <button 
                onClick={() => setUserProfile(null)}
                className="ml-auto text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear Profile
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{userProfile.name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Experience Level</p>
                <p className="font-medium capitalize">{userProfile.experience_level || 'Entry'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Education</p>
                <p className="font-medium">{userProfile.education || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location Preference</p>
                <p className="font-medium">{userProfile.location_preference || 'Flexible'}</p>
              </div>
            </div>
            {userProfile.skills && userProfile.skills.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills"
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                >
                  <option value="internship">Internship</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                </select>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="h-10 self-end flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            <h2 className="text-2xl font-semibold text-gray-800">
              {userProfile ? 'Recommended for You' : 'Available Opportunities'}
            </h2>
            {jobs.length > 0 && (
              <p className="text-gray-600">{filterJobs().length} jobs found</p>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filterJobs().length > 0 ? (
                filterJobs().map(job => (
                  <div 
                    key={job.id}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center">
                      {/* Company Logo */}
                      <div className="mb-4 md:mb-0 md:mr-6">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={job.logo} 
                            alt={`${job.company} logo`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs" style={{display: 'none'}}>
                            No Logo
                          </div>
                        </div>
                      </div>
                      
                      {/* Job Details */}
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-1">{job.title}</h3>
                            <div className="flex items-center gap-4 text-gray-600 mb-2">
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
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {job.type}
                            </span>
                            {job.source && (
                              <span className="inline-block px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600">
                                {job.source}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {job.description}
                        </p>
                        
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.slice(0, 6).map((skill, index) => (
                              <span 
                                key={index} 
                                className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 6 && (
                              <span className="text-gray-500 text-xs">
                                +{job.skills.length - 6} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div className="text-blue-600 font-semibold mb-2 sm:mb-0">
                            {job.salary}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button 
                              className={`p-2 rounded-full transition-colors ${
                                savedJobs.includes(job.id) 
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
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
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Apply Now
                                <FiExternalLink className="ml-2" size={16} />
                              </a>
                            ) : (
                              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <div className="text-gray-400 mb-4">
                    <FiSearch size={48} className="mx-auto" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    {loading ? 'Loading jobs...' : 'No job listings match your search criteria.'}
                  </p>
                  {!loading && (
                    <button 
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        setSearchTerm('')
                        setFilters({ jobType: 'internship', location: 'all' })
                        setTimeout(() => {
                          if (userProfile) {
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
        {userProfile && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              💡 Job Search Tips Based on Your Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Skill Recommendations</h4>
                <p className="text-blue-700 text-sm">
                  Based on current job trends, consider learning React, Node.js, or Python to increase your opportunities.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Application Tips</h4>
                <p className="text-green-700 text-sm">
                  Tailor your resume for each application and highlight projects that match the job requirements.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard