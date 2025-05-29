import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { motion } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { current, logout } = useUser()
  const location = useLocation()
  const navigate = useNavigate()

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle logout
  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isMenuOpen || location.pathname !== '/' 
          ? 'bg-gray-900/95 backdrop-blur-md shadow-xl border-b border-gray-800' 
          : 'bg-transparent'
      } py-4`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <motion.div 
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Gigrithm
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`font-medium transition-colors ${
              location.pathname === '/' 
                ? 'text-blue-400' 
                : 'text-gray-300 hover:text-blue-400'
            }`}
          >
            Home
          </Link>
          
          {current ? (
            <>
              <Link 
                to="/dashboard" 
                className={`font-medium transition-colors ${
                  location.pathname === '/dashboard' 
                    ? 'text-blue-400' 
                    : 'text-gray-300 hover:text-blue-400'
                }`}
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="border border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-400 font-semibold px-6 py-2 rounded-full transition-all duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="border border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-400 font-semibold px-6 py-2 rounded-full transition-all duration-300"
              >
                Sign In
              </Link>
              <Link 
                to="/upload-resume" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-full transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-300 hover:text-white transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div 
          className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`font-medium py-2 transition-colors ${
                location.pathname === '/' 
                  ? 'text-blue-400' 
                  : 'text-gray-300 hover:text-blue-400'
              }`}
            >
              Home
            </Link>
            
            {current ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`font-medium py-2 transition-colors ${
                    location.pathname === '/dashboard' 
                      ? 'text-blue-400' 
                      : 'text-gray-300 hover:text-blue-400'
                  }`}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="border border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-400 font-semibold px-6 py-2 rounded-full transition-all duration-300 w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="border border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-400 font-semibold px-6 py-2 rounded-full transition-all duration-300 text-center"
                >
                  Sign In
                </Link>
                <Link 
                  to="/upload-resume" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-full transition-all duration-300 text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  )
}

export default Navbar