import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiArrowRight } from 'react-icons/fi'

function NotFound() {
  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-md mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-30"></div>
            <h1 className="relative text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
              404
            </h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            The page you are looking for doesn&#39;t exist or has been moved.
          </p>
          <Link 
            to="/" 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full inline-flex items-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25"
          >
            <FiHome className="mr-2" />
            Return Home
            <FiArrowRight className="ml-2" />
          </Link>
          
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound