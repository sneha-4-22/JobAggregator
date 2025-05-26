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
          ? 'bg-white shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container-custom flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <motion.div 
            className="text-2xl font-bold text-primary-600"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            CareerConnect
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`font-medium transition-colors ${
              location.pathname === '/' 
                ? 'text-primary-600' 
                : 'text-gray-700 hover:text-primary-600'
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
                    ? 'text-primary-600' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="btn-outline"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/upload-resume" className="btn-primary">
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div 
          className="md:hidden bg-white"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="container-custom py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`font-medium py-2 transition-colors ${
                location.pathname === '/' 
                  ? 'text-primary-600' 
                  : 'text-gray-700'
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
                      ? 'text-primary-600' 
                      : 'text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="btn-outline w-full py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/upload-resume" className="btn-primary w-full text-center">
                Get Started
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  )
}

export default Navbar