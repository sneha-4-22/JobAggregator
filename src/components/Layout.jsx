import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { motion } from 'framer-motion'

function Layout() {
  const location = useLocation()
  const showFooter = location.pathname === '/'

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Navbar />
      <motion.main 
        className="flex-grow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>
      {showFooter && <Footer />}
    </div>
  )
}

export default Layout