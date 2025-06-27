import { useEffect, useState } from 'react'
import { FiBookmark, FiCalendar, FiCheckCircle, FiClock, FiExternalLink, FiFilter, FiMapPin, FiSearch, FiUsers, FiAward, FiDollarSign } from 'react-icons/fi'
import { useUser } from '../context/UserContext'
import BugReportButton from './BugReportButton'

function Hackathons() {
  const [hackathons, setHackathons] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedHackathons, setSavedHackathons] = useState([])
  const [filters, setFilters] = useState({
    mode: 'all', 
    status: 'all',
    difficulty: 'all'
  })

  const { current: user, hasResume, userProfile } = useUser()
  const API_BASE_URL = 'https://hackathon-scrapper.onrender.com'

  useEffect(() => {
    if (hasResume && userProfile) {
      fetchPersonalizedHackathons()
    } else {
      fetchDefaultHackathons()
    }
  }, [hasResume, userProfile, filters])

  const fetchDefaultHackathons = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        mode: filters.mode === 'all' ? '' : filters.mode,
        status: filters.status === 'all' ? '' : filters.status,
        difficulty: filters.difficulty === 'all' ? '' : filters.difficulty
      })
      
      const response = await fetch(`${API_BASE_URL}/api/search-hackathons?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setHackathons(data.success ? data.hackathons || [] : [])
    } catch (error) {
      console.error('Error fetching hackathons:', error)
      setHackathons([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPersonalizedHackathons = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/get-personalized-hackathons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: userProfile?.skills || [],
          experience_level: userProfile?.experience_level || 'beginner',
          interests: userProfile?.interests || [],
          preferred_mode: filters.mode === 'all' ? 'any' : filters.mode
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setHackathons(data.success ? data.hackathons || [] : [])
    } catch (error) {
      console.error('Error fetching personalized hackathons:', error)
      setHackathons([])
    } finally {
      setLoading(false)
    }
  }

  const toggleSaveHackathon = (hackathonId) => {
    setSavedHackathons(prev => 
      prev.includes(hackathonId) 
        ? prev.filter(id => id !== hackathonId)
        : [...prev, hackathonId]
    )
  }

  const filteredHackathons = hackathons.filter(hackathon => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      hackathon.title?.toLowerCase().includes(searchLower) ||
      hackathon.organizer?.toLowerCase().includes(searchLower) ||
      hackathon.description?.toLowerCase().includes(searchLower) ||
      hackathon.themes?.some(theme => theme.toLowerCase().includes(searchLower)) ||
      hackathon.technologies?.some(tech => tech.toLowerCase().includes(searchLower))
    )
  })

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const handleSearch = () => {
    hasResume && userProfile ? fetchPersonalizedHackathons() : fetchDefaultHackathons()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || ''
    if (statusLower.includes('upcoming') || statusLower.includes('open')) {
      return 'bg-green-900/50 text-green-300 border-green-500/30'
    } else if (statusLower.includes('ongoing') || statusLower.includes('live')) {
      return 'bg-blue-900/50 text-blue-300 border-blue-500/30'
    } else if (statusLower.includes('ended') || statusLower.includes('closed')) {
      return 'bg-gray-900/50 text-gray-300 border-gray-500/30'
    }
    return 'bg-purple-900/50 text-purple-300 border-purple-500/30'
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({ mode: 'all', status: 'all', difficulty: 'all' })
    setTimeout(() => {
      hasResume && userProfile ? fetchPersonalizedHackathons() : fetchDefaultHackathons()
    }, 100)
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏆 Discover Amazing Hackathons
          </h1>
          <p className="text-gray-300 text-lg">
            Find hackathons that match your skills and interests
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search hackathons, themes, or technologies"
                className="pl-10 w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1">Mode</label>
                <select 
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select 
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="past">Past</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
                <select 
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
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

        {/* Hackathon Listings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">
              {hasResume ? 'Recommended for You' : 'Available Hackathons'}
            </h2>
            {hackathons.length > 0 && (
              <p className="text-gray-300">{filteredHackathons.length} hackathons found</p>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredHackathons.length > 0 ? (
                filteredHackathons.map((hackathon, index) => (
                  <div 
                    key={hackathon.id || index}
                    className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-blue-500/50 group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start">
                      {/* Hackathon Logo/Icon */}
                      <div className="mb-4 md:mb-0 md:mr-6">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 border border-gray-600 flex items-center justify-center">
                          {hackathon.logo ? (
                            <img 
                              src={hackathon.logo} 
                              alt={`${hackathon.title} logo`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                            <FiAward />
                          </div>
                        </div>
                      </div>
                      
                      {/* Hackathon Details */}
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                              {hackathon.title || hackathon.name || 'Untitled Hackathon'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-2">
                              {hackathon.organizer && (
                                <div className="flex items-center">
                                  <FiUsers className="mr-1" size={14} />
                                  <span>{hackathon.organizer}</span>
                                </div>
                              )}
                              {hackathon.location && (
                                <div className="flex items-center">
                                  <FiMapPin className="mr-1" size={14} />
                                  <span>{hackathon.location}</span>
                                </div>
                              )}
                              {hackathon.duration && (
                                <div className="flex items-center">
                                  <FiClock className="mr-1" size={14} />
                                  <span>{hackathon.duration}</span>
                                </div>
                              )}
                              {(hackathon.start_date || hackathon.date) && (
                                <div className="flex items-center">
                                  <FiCalendar className="mr-1" size={14} />
                                  <span>{formatDate(hackathon.start_date || hackathon.date)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {hackathon.status && (
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(hackathon.status)}`}>
                                {hackathon.status}
                              </span>
                            )}
                            {hackathon.mode && (
                              <span className="inline-block px-2 py-1 rounded-md text-xs bg-gray-700 text-gray-300 border border-gray-600">
                                {hackathon.mode}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 mb-4 line-clamp-2">
                          {hackathon.description || 'No description available'}
                        </p>
                        
                        {/* Themes/Technologies */}
                        {(hackathon.themes || hackathon.technologies) && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(hackathon.themes || hackathon.technologies || []).slice(0, 6).map((item, index) => (
                              <span 
                                key={index} 
                                className="bg-gray-700 text-gray-200 px-2 py-1 rounded-md text-xs border border-gray-600"
                              >
                                {item}
                              </span>
                            ))}
                            {(hackathon.themes || hackathon.technologies || []).length > 6 && (
                              <span className="text-gray-400 text-xs">
                                +{(hackathon.themes || hackathon.technologies || []).length - 6} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div className="text-blue-400 font-semibold mb-2 sm:mb-0 flex items-center">
                            {hackathon.prize_pool && (
                              <>
                                <FiDollarSign className="mr-1" size={16} />
                                {hackathon.prize_pool}
                              </>
                            )}
                            {hackathon.team_size && (
                              <span className="ml-4 text-gray-400">
                                <FiUsers className="inline mr-1" size={14} />
                                Team: {hackathon.team_size}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button 
                              className={`p-2 rounded-full transition-colors ${
                                savedHackathons.includes(hackathon.id || index)
                                  ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30'
                                  : 'bg-gray-700 text-gray-400 hover:bg-blue-900/30 hover:text-blue-400 border border-gray-600'
                              }`}
                              onClick={() => toggleSaveHackathon(hackathon.id || index)}
                              aria-label={savedHackathons.includes(hackathon.id || index) ? "Unsave hackathon" : "Save hackathon"}
                            >
                              {savedHackathons.includes(hackathon.id || index) ? <FiCheckCircle size={20} /> : <FiBookmark size={20} />}
                            </button>
                            
                            {hackathon.registration_link || hackathon.link ? (
                              <a
                                href={hackathon.registration_link || hackathon.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                              >
                                Register Now
                                <FiExternalLink className="ml-2" size={16} />
                              </a>
                            ) : (
                              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105">
                                View Details
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
                    {loading ? 'Loading hackathons...' : 'No hackathons match your search criteria.'}
                  </p>
                  {!loading && (
                    <button 
                      className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
                      onClick={clearFilters}
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
              💡 Hackathon Tips Based on Your Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                <h4 className="font-medium text-blue-300 mb-2">Skill Matching</h4>
                <p className="text-blue-200 text-sm">
                  {userProfile.experience_level === 'beginner' 
                    ? "Look for beginner-friendly hackathons with mentorship programs to build your skills."
                    : "Your experience level qualifies you for advanced hackathons with bigger prizes and challenges."
                  }
                </p>
              </div>
              <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                <h4 className="font-medium text-green-300 mb-2">Success Tips</h4>
                <p className="text-green-200 text-sm">
                  Form diverse teams, focus on solving real problems, and don&apos;t forget to present your solution clearly!
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

export default Hackathons