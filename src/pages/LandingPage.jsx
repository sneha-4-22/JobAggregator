import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiSearch, FiUsers, FiCheckCircle, FiBriefcase } from 'react-icons/fi'

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
      <section className="relative bg-gradient-to-r from-primary-900 to-secondary-900 text-white">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative container-custom py-20 md:py-28 lg:py-36">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              variants={itemVariants}
            >
              Find Your Dream Job or Internship
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl mb-8 text-gray-100"
              variants={itemVariants}
            >
              Upload your resume once, and we'll connect you with the best opportunities from across the web.
            </motion.p>
            <motion.div variants={itemVariants}>
              <Link 
                to="/upload-resume" 
                className="btn-primary text-base md:text-lg px-8 py-3 inline-flex items-center"
              >
                Get Started <FiArrowRight className="ml-2" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform simplifies your job search with a few easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <motion.div 
              className="card text-center"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary-100 text-primary-600">
                <FiUsers size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Upload Your Resume</h3>
              <p className="text-gray-600">
                Just upload your resume once, and we'll automatically extract your information.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              className="card text-center"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-secondary-100 text-secondary-600">
                <FiCheckCircle size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Verify Your Email</h3>
              <p className="text-gray-600">
                Confirm your email address and create your secure account.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              className="card text-center"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-accent-100 text-accent-600">
                <FiSearch size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Get Matched</h3>
              <p className="text-gray-600">
                Our AI matching system finds relevant jobs and internships just for you.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              className="card text-center"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-success-100 text-success-600">
                <FiBriefcase size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Apply With Ease</h3>
              <p className="text-gray-600">
                Apply to multiple positions with a single click and track your applications.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="card text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-4xl font-bold text-primary-600 mb-2">10,000+</h3>
              <p className="text-lg text-gray-600">Jobs & Internships</p>
            </motion.div>
            
            <motion.div 
              className="card text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-4xl font-bold text-secondary-600 mb-2">5,000+</h3>
              <p className="text-lg text-gray-600">Happy Users</p>
            </motion.div>
            
            <motion.div 
              className="card text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-4xl font-bold text-accent-600 mb-2">500+</h3>
              <p className="text-lg text-gray-600">Partner Companies</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              3rd Year Students at Manav Rachna University
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mb-6 mx-auto">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-48 h-48 rounded-full object-cover mx-auto shadow-lg transform transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary-900 text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Job Search?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Upload your resume now and let us help you find your next opportunity.
            </p>
            <Link 
              to="/upload-resume" 
              className="btn-primary text-lg px-8 py-3 inline-flex items-center"
            >
              Get Started <FiArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage