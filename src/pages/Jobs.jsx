import { useEffect, useState } from 'react'
import { FiBookmark, FiBriefcase, FiCheckCircle, FiClock, FiExternalLink, FiFilter, FiMapPin, FiSearch, FiX } from 'react-icons/fi'
import { useUser } from '../context/UserContext'
import AddNewJobForm from './AddnewJobForm'
import { databases, Query } from '../appwrite';
import BugReportButton from './BugReportButton';
function Jobs() {
  const [jobs, setJobs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedJobs, setSavedJobs] = useState([])
  const [userPostedJobs, setUserPostedJobs] = useState([]);
  const [filters, setFilters] = useState({
    jobType: 'internship',
    location: 'all'
  })
  const fetchUserPostedJobs = async () => {
  try {
    const response = await databases.listDocuments(
      'gigrithm',
      'aggregated_jobs',
      [
        Query.equal('createdBy', user?.email || '')
      ]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching user jobs:', error);
    return [];
  }
};
const deleteUserJob = async (documentId) => {
  try {
    await databases.deleteDocument('gigrithm', 'aggregated_jobs', documentId);
    // Refresh the jobs list
    fetchUserPostedJobs();
  } catch (error) {
    console.error('Error deleting job:', error);
    alert('Failed to delete job');
  }
};
  const { 
    current: user, 
    hasResume, 
    userProfile, 
  } = useUser()

  const API_BASE_URL = 'https://gigi-back.onrender.com'
  const rec_API_BASE_URL = 'https://job-recommendation-api-jh7p.onrender.com'
  useEffect(() => {
    if (user?.email) {
    fetchUserPostedJobs().then(setUserPostedJobs);
  }
    if (hasResume && userProfile) {
      fetchPersonalizedJobs()
    } else {
      fetchDefaultJobs()
    }
  }, [user, hasResume, userProfile, filters]);
  
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
    <div className="pt-32 pb-16 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        {userPostedJobs.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Your Posted Jobs</h3>
           {userPostedJobs.map(job => (
  <div 
    key={job.$id}
    className="bg-gray-800 rounded-xl shadow-lg p-6 border border-blue-500 mb-4"
  >
    <div className="flex justify-between items-start">
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-lg font-semibold text-white">{job.jobRole}</h4>
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105 px-2 py-1 text-xs border border-blue-500">
            Your Post
          </span>
        </div>
        <p className="text-gray-300 mb-2">
          <span className="font-medium">{job.companyName}</span> • {job.location}
        </p>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{job.description}</p>
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span key={index} className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <button
        onClick={() => {
          if (window.confirm('Are you sure you want to delete this job posting?')) {
            deleteUserJob(job.$id);
          }
        }}
        className="ml-4 p-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900 transition-colors border border-red-500/30"
        title="Delete job posting"
      >
        <FiX size={18} />
      </button>
    </div>
  </div>
))}
          </div>
        )}
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
      <AddNewJobForm
  userEmail={user?.email || ''} 
  userName={user?.name || ''} 
/>
    </div>
  )
}

export default Jobs