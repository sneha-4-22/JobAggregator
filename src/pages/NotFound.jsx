import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome } from 'react-icons/fi'

function NotFound() {
  return (
    <div className="pt-20 pb-16 min-h-screen flex items-center justify-center">
      <div className="container-custom">
        <motion.div 
          className="max-w-md mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center">
            <FiHome className="mr-2" />
            Return Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound