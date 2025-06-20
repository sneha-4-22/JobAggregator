import { motion } from 'framer-motion';
import { FiArrowRight, FiSearch, FiUsers, FiCheckCircle, FiBriefcase } from 'react-icons/fi';
import { Link } from 'react-router-dom';
function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  const teamMembers = [
    {
      name: "Sneha Kumari",
      role: "MERN Developer",
      image: "https://i.pinimg.com/736x/bb/65/bd/bb65bdeab14fcb2e332edcdfae569465.jpg"
    },
    {
      name: "Shivani Sharma",
      role: "AI Developer",
      image: "https://i.pinimg.com/736x/8e/c5/d0/8ec5d0643e93cb05ab0b50fa48b51e89.jpg"
    },
    {
      name: "Eshaan Gupta",
      role: "ML Engineer",
      image: "https://i.pinimg.com/736x/6b/b6/1c/6bb61c9bf2398f4bc6c0b3155da7ca85.jpg"
    }
  ]

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white min-h-[60vh] flex items-center">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
              variants={itemVariants}
            >
              Find Your Dream Job or{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Internship
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Upload your resume once, and we&#39;ll connect you with the best opportunities from across the web.
            </motion.p>
            <motion.div variants={itemVariants}>
             <Link 
  to="/upload-resume"
  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg px-10 py-4 rounded-full inline-flex items-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
>
  Get Started <FiArrowRight className="ml-3" size={20} />
</Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Our platform simplifies your job search with a few easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <motion.div 
              className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 group"
              whileHover={{ y: -10, scale: 1.02 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiUsers size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Upload Your Resume</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Just upload your resume once, and we&#39;ll automatically extract your information.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 group"
              whileHover={{ y: -10, scale: 1.02 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiCheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Verify Your Email</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Confirm your email address and create your secure account.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 group"
              whileHover={{ y: -10, scale: 1.02 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiSearch size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Get Matched</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our AI matching system finds relevant jobs and internships just for you.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700 hover:border-teal-500 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/20 group"
              whileHover={{ y: -10, scale: 1.02 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiBriefcase size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Apply With Ease</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Apply to multiple positions with a single click and track your applications.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-800">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-700 hover:border-blue-400 transition-all duration-300 hover:shadow-xl group"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                10,000+
              </h3>
              <p className="text-xl text-gray-300 font-semibold">Jobs & Internships</p>
            </motion.div>
            
            <motion.div 
              className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-700 hover:border-green-400 transition-all duration-300 hover:shadow-xl group"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                5,000+
              </h3>
              <p className="text-xl text-gray-300 font-semibold">Happy Users</p>
            </motion.div>
            
            <motion.div 
              className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-700 hover:border-purple-400 transition-all duration-300 hover:shadow-xl group"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                500+
              </h3>
              <p className="text-xl text-gray-300 font-semibold">Partner Companies</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Meet Our Team</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              3rd Year Students at Manav Rachna University
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="mb-8 mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="relative w-48 h-48 rounded-full object-cover mx-auto shadow-2xl transform transition-all duration-300 group-hover:scale-105 border-4 border-gray-700 group-hover:border-blue-400"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-lg text-gray-300 font-medium">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Ready to Start Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Job Search?
              </span>
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-200 leading-relaxed">
              Upload your resume now and let us help you find your next opportunity.
            </p>
           <Link 
  to="/upload-resume"
  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg px-10 py-4 rounded-full inline-flex items-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
>
  Get Started <FiArrowRight className="ml-3" size={20} />
</Link>
          </motion.div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage;