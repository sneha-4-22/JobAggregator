import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiMapPin, FiBriefcase, FiClock, FiBookmark, FiCheckCircle } from 'react-icons/fi'
import { useUser } from '../context/UserContext'

// Mock data for job listings
const mockJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$90,000 - $120,000',
    posted: '2 days ago',
    description: 'We are looking for a skilled Frontend Developer to join our growing team. You will be responsible for building responsive web applications using React.',
    skills: ['React', 'JavaScript', 'CSS', 'HTML'],
    logo: 'https://images.pexels.com/photos/5691602/pexels-photo-5691602.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 2,
    title: 'Software Engineering Intern',
    company: 'InnovateTech',
    location: 'Remote',
    type: 'Internship',
    salary: '$30/hr',
    posted: '1 day ago',
    description: 'Looking for a software engineering intern to work on our core product. You will be mentored by senior engineers and work on real projects.',
    skills: ['Python', 'JavaScript', 'Git'],
    logo: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 3,
    title: 'UX/UI Designer',
    company: 'DesignHub',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$85,000 - $110,000',
    posted: '3 days ago',
    description: 'Join our design team to create beautiful and functional user interfaces for web and mobile applications.',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Testing'],
    logo: 'https://images.pexels.com/photos/1181248/pexels-photo-1181248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 4,
    title: 'Data Science Intern',
    company: 'DataWorks',
    location: 'Boston, MA',
    type: 'Internship',
    salary: '$25/hr',
    posted: '5 days ago',
    description: 'Exciting opportunity for a data science intern to work with big data and machine learning models.',
    skills: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
    logo: 'https://images.pexels.com/photos/936137/pexels-photo-936137.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 5,
    title: 'Backend Developer',
    company: 'ServerSide Inc',
    location: 'Austin, TX',
    type: 'Full-time',
    salary: '$95,000 - $130,000',
    posted: '1 week ago',
    description: 'Looking for an experienced backend developer to build and maintain our server infrastructure and APIs.',
    skills: ['Node.js', 'Express', 'MongoDB', 'AWS'],
    logo: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
]

function Dashboard() {
  const { current } = useUser()
  const [jobs, setJobs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [savedJobs, setSavedJobs] = useState([])
  const [filters, setFilters] = useState({
    jobType: 'all',
    location: 'all'
  })

  useEffect(() => {
    // Simulate API call to get job listings
    const fetchJobs = async () => {
      setLoading(true)
      // In a real app, this would be an API call
      setTimeout(() => {
        setJobs(mockJobs)
        setLoading(false)
      }, 1000)
    }

    fetchJobs()
  }, [])

  const toggleSaveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId))
    } else {
      setSavedJobs([...savedJobs, jobId])
    }
  }

  const filterJobs = () => {
    let filteredJobs = [...jobs]
    
    // Apply search term
    if (searchTerm) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Apply job type filter
    if (filters.jobType !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.type === filters.jobType)
    }
    
    // Apply location filter
    if (filters.location !== 'all') {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
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

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {current?.name || 'User'}!
          </h1>
          <p className="text-gray-600">
            Here are personalized job and internship recommendations for you.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white rounded-xl shadow-card p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills"
                className="pl-10 form-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <label className="form-label">Job Type</label>
                <select 
                  className="form-input"
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              
              <div className="relative">
                <label className="form-label">Location</label>
                <select 
                  className="form-input"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                >
                  <option value="all">All Locations</option>
                  <option value="Remote">Remote</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="New York">New York</option>
                  <option value="Austin">Austin</option>
                  <option value="Boston">Boston</option>
                </select>
              </div>
              
              <button className="btn-primary h-10 self-end flex items-center justify-center">
                <FiFilter className="mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Recommended for You
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-primary-600 text-xl">Loading job listings...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filterJobs().length > 0 ? (
                filterJobs().map(job => (
                  <motion.div 
                    key={job.id}
                    className="card hover:border-l-4 hover:border-l-primary-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center">
                      {/* Company Logo */}
                      <div className="mb-4 md:mb-0 md:mr-6">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={job.logo} 
                            alt={`${job.company} logo`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Job Details */}
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                          <div className="mt-2 md:mt-0">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium 
                              ${job.type === 'Internship' 
                                ? 'bg-accent-100 text-accent-800' 
                                : 'bg-success-100 text-success-800'
                              }`}
                            >
                              {job.type}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center text-gray-600 mb-3">
                          <div className="flex items-center mr-4">
                            <FiBriefcase className="mr-1" size={14} />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center mr-4">
                            <FiMapPin className="mr-1" size={14} />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center">
                            <FiClock className="mr-1" size={14} />
                            <span>Posted {job.posted}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">
                          {job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.map(skill => (
                            <span 
                              key={skill} 
                              className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div className="text-primary-600 font-semibold mb-2 sm:mb-0">
                            {job.salary}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button 
                              className={`p-2 rounded-full ${
                                savedJobs.includes(job.id) 
                                  ? 'bg-primary-100 text-primary-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                              }`}
                              onClick={() => toggleSaveJob(job.id)}
                              aria-label={savedJobs.includes(job.id) ? "Unsave job" : "Save job"}
                            >
                              {savedJobs.includes(job.id) ? <FiCheckCircle size={20} /> : <FiBookmark size={20} />}
                            </button>
                            <button className="btn-primary">
                              Apply Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-card">
                  <p className="text-gray-600">No job listings match your search criteria.</p>
                  <button 
                    className="mt-4 btn-outline"
                    onClick={() => {
                      setSearchTerm('')
                      setFilters({ jobType: 'all', location: 'all' })
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard