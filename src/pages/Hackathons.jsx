import { useEffect, useState } from 'react'
import { FiBookmark, FiCalendar, FiCheckCircle, FiExternalLink, FiFilter, FiMapPin, FiSearch, FiTrophy, FiUsers } from 'react-icons/fi'
import { useUser } from '../context/UserContext'
import AddNewJobForm from './AddnewJobForm'

function Hackathons() {
  const [hackathons, setHackathons] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedHackathons, setSavedHackathons] = useState([])
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false)
  const [filters, setFilters] = useState({
    mode: 'all',
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

  const API_BASE_URL = 'https://hackathon-scrapper.onrender.com'

  const userStats = getUserStats()

  useEffect(() => {
    fetchHackathons()
  }, [filters])

  const fetchHackathons = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        location: filters.location === 'all' ? '' : filters.location,
        mode: filters.mode === 'all' ? '' : filters.mode
      })
      
      const response = await fetch(`${API_BASE_URL}/api/hackathons?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }
      
      const data = await response.json()
      
      if (data.success) {
        setHackathons(data.hackathons || data.data || [])
      } else {
        console.error('Error fetching hackathons:', data.error)
        setHackathons([])
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
      setHackathons([])
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
      await updateResumeData(file)
      alert('Resume analyzed successfully! Getting personalized hackathon recommendations...')
    } catch (error) {
      console.error('Error uploading resume:', error)
      alert('Error uploading resume: ' + error.message)
    } finally {
      setResumeAnalyzing(false)
      event.target.value = ''
    }
  }

  const toggleSaveHackathon = (hackathonId) => {
    if (savedHackathons.includes(hackathonId)) {
      setSavedHackathons(savedHackathons.filter(id => id !== hackathonId))
    } else {
      setSavedHackathons([...savedHackathons, hackathonId])
    }
  }

  const filterHackathons = () => {
    let filteredHackathons = [...hackathons]
    
    if (searchTerm) {
      filteredHackathons = filteredHackathons.filter(hackathon => 
        hackathon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hackathon.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hackathon.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filteredHackathons
  }

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    })
  }

  const handleSearch = () => {
    fetchHackathons()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateString
    }
  }

  const isDeadlinePassed = (deadlineString) => {
    if (!deadlineString) return false
    try {
      const deadline = new Date(deadlineString)
      return deadline < new Date()
    } catch {
      return false
    }
  }

  const getDaysUntilDeadline = (deadlineString) => {
    if (!deadlineString) return null
    try {
      const deadline = new Date(deadlineString)
      const now = new Date()
      const diffTime = deadline - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return null
    }
  }

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`)
        if (response.ok) {
          console.log('Hackathon API connection successful')
        } else {
          console.warn('Hackathon API connection failed - check if server is running')
        }
      } catch {
        console.warn('Cannot connect to Hackathon server - make sure it\'s running on https://hackathon-scrapper.onrender.com')
      }
    }
    testConnection()
  }, [])

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏆 Hackathon Opportunities
          </h1>
          <p className="text-gray-300">
            Discover exciting hackathons to showcase your skills and build amazing projects
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search hackathons, organizations, or locations"
                className="pl-10 w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1">Mode</label>
                <select 
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  value={filters.mode}
                  onChange={(e) => handleFilterChange('mode', e.target.value)}
                >
                  <option value="all">All Modes</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                <select 
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                >
                  <option value="all">All Locations</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="Global">Global</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                </select>
              </div>
              
              <button 
                onClick={handleSearch}
                className="h-10 self-end flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-all duration-300"
                disabled={loading}
              >
                <FiFilter className="mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Hackathon Listings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">
              {hasResume ? 'Recommended Hackathons' : 'Available Hackathons'}
            </h2>
            {hackathons.length > 0 && (
              <p className="text-gray-300">{filterHackathons().length} hackathons found</p>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filterHackathons().length > 0 ? (
                filterHackathons().map((hackathon, index) => {
                  const daysUntilDeadline = getDaysUntilDeadline(hackathon.registration_deadline)
                  const isExpired = isDeadlinePassed(hackathon.registration_deadline)
                  
                  return (
                    <div 
                      key={hackathon.id || index}
                      className={`bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-purple-500/50 group ${
                        isExpired ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start">
                        {/* Hackathon Icon */}
                        <div className="mb-4 md:mb-0 md:mr-6">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 flex-shrink-0 border border-gray-600 flex items-center justify-center">
                            <FiTrophy className="text-white text-2xl" />
                          </div>
                        </div>
                        
                        {/* Hackathon Details */}
                        <div className="flex-grow">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                            <div className="flex-grow">
                              <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
                                {hackathon.title || 'Untitled Hackathon'}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-2">
                                <div className="flex items-center">
                                  <FiUsers className="mr-1" size={14} />
                                  <span>{hackathon.organization || 'Unknown Organization'}</span>
                                </div>
                                {hackathon.location && (
                                  <div className="flex items-center">
                                    <FiMapPin className="mr-1" size={14} />
                                    <span>{hackathon.location}</span>
                                  </div>
                                )}
                                {hackathon.start_date && (
                                  <div className="flex items-center">
                                    <FiCalendar className="mr-1" size={14} />
                                    <span>Starts {formatDate(hackathon.start_date)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                              {hackathon.mode && (
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium 
                                  ${hackathon.mode.toLowerCase() === 'online' 
                                    ? 'bg-green-900/50 text-green-300 border border-green-500/30' 
                                    : hackathon.mode.toLowerCase() === 'offline'
                                    ? 'bg-blue-900/50 text-blue-300 border border-blue-500/30'
                                    : 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
                                  }`}
                                >
                                  {hackathon.mode}
                                </span>
                              )}
                              {hackathon.prize && (
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-300 border border-yellow-500/30">
                                  💰 {hackathon.prize}
                                </span>
                              )}
                              {daysUntilDeadline !== null && !isExpired && (
                                <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium
                                  ${daysUntilDeadline <= 3 
                                    ? 'bg-red-900/50 text-red-300 border border-red-500/30' 
                                    : daysUntilDeadline <= 7
                                    ? 'bg-orange-900/50 text-orange-300 border border-orange-500/30'
                                    : 'bg-gray-700 text-gray-300 border border-gray-600'
                                  }`}
                                >
                                  {daysUntilDeadline <= 0 ? 'Deadline Today!' : `${daysUntilDeadline} days left`}
                                </span>
                              )}
                              {isExpired && (
                                <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-gray-700 text-gray-400 border border-gray-600">
                                  Registration Closed
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Dates Information */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                            <div>
                              <div className="text-xs text-gray-400 mb-1">Registration Deadline</div>
                              <div className="text-sm text-white font-medium">
                                {hackathon.registration_deadline ? formatDate(hackathon.registration_deadline) : 'TBA'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 mb-1">Submission Deadline</div>
                              <div className="text-sm text-white font-medium">
                                {hackathon.submission_deadline ? formatDate(hackathon.submission_deadline) : 'TBA'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div className="text-purple-400 font-semibold mb-2 sm:mb-0">
                              {hackathon.prize ? `Prize: ${hackathon.prize}` : 'Great Learning Opportunity'}
                            </div>
                            
                            <div className="flex space-x-2">
                              <button 
                                className={`p-2 rounded-full transition-colors ${
                                  savedHackathons.includes(hackathon.id || index) 
                                    ? 'bg-purple-900/50 text-purple-400 border border-purple-500/30'
                                    : 'bg-gray-700 text-gray-400 hover:bg-purple-900/30 hover:text-purple-400 border border-gray-600'
                                }`}
                                onClick={() => toggleSaveHackathon(hackathon.id || index)}
                                aria-label={savedHackathons.includes(hackathon.id || index) ? "Unsave hackathon" : "Save hackathon"}
                              >
                                {savedHackathons.includes(hackathon.id || index) ? <FiCheckCircle size={20} /> : <FiBookmark size={20} />}
                              </button>
                              
                              {hackathon.participation_link && hackathon.participation_link !== '#' ? (
                                <a
                                  href={hackathon.participation_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                                    isExpired 
                                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
                                  }`}
                                  {...(isExpired && { onClick: (e) => e.preventDefault() })}
                                >
                                  {isExpired ? 'Registration Closed' : 'Register Now'}
                                  {!isExpired && <FiExternalLink className="ml-2" size={16} />}
                                </a>
                              ) : (
                                <button 
                                  className={`px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                                    isExpired 
                                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
                                  }`}
                                  disabled={isExpired}
                                >
                                  {isExpired ? 'Registration Closed' : 'Register Now'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                  <div className="text-gray-400 mb-4">
                    <FiSearch size={48} className="mx-auto" />
                  </div>
                  <p className="text-gray-300 mb-4">
                    {loading ? 'Loading hackathons...' : 'No hackathons match your search criteria.'}
                  </p>
                  {!loading && (
                    <button 
                      className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
                      onClick={() => {
                        setSearchTerm('')
                        setFilters({ mode: 'all', location: 'all' })
                        setTimeout(() => {
                          fetchHackathons()
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
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            💡 Hackathon Success Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
              <h4 className="font-medium text-purple-300 mb-2">Preparation</h4>
              <p className="text-purple-200 text-sm">
                Research the theme, form a balanced team, and prepare your development environment beforehand.
              </p>
            </div>
            <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
              <h4 className="font-medium text-green-300 mb-2">During the Event</h4>
              <p className="text-green-200 text-sm">
                Focus on a viable MVP, manage time effectively, and don't forget to document your process.
              </p>
            </div>
            <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
              <h4 className="font-medium text-blue-300 mb-2">Presentation</h4>
              <p className="text-blue-200 text-sm">
                Tell a compelling story, highlight the problem you're solving, and demo your working solution.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <AddNewJobForm
        userEmail={user?.email || ''} 
        userName={user?.name || ''} 
      />
    </div>
  )
}

export default Hackathons