import {
    Briefcase as FiBriefcase,
    Check as FiCheck,
    Plus as FiPlus,
    Send as FiSend,
    X as FiX
} from 'lucide-react';
import { useState } from 'react';

const AddJobModal = ({ isOpen, onClose, userEmail = '', userName = '' }) => {
  const [formData, setFormData] = useState({
    jobId: '', // Will be auto-generated
    jobRole: '',
    companyName: '',
    description: '',
    stipend: '',
    duration: '',
    location: 'On site',
    applyLink: '',
    skills: [],
    site: '', // Company website or job board
    jobType: 'internship',
    category: 'technology',
    experienceLevel: 'entry',
    applicationDeadline: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Appwrite configuration - Replace with your actual values
  const APPWRITE_PROJECT_ID = '6842e9050013dcd9e1bb';
  const APPWRITE_DATABASE_ID = 'gigrithm';
  const APPWRITE_COLLECTION_ID = 'aggregated_jobs';
  const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.jobRole.trim()) {
      newErrors.jobRole = 'Job role is required';
    }
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    
    if (!formData.applyLink.trim()) {
      newErrors.applyLink = 'Application link is required';
    } else if (!/^https?:\/\/.+/.test(formData.applyLink)) {
      newErrors.applyLink = 'Please enter a valid URL (starting with http:// or https://)';
    }
    
    if (formData.skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }
    
    if (!formData.site.trim()) {
      newErrors.site = 'Site/Source is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateJobId = () => {
    return `JOB-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  };

  const submitJob = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Generate unique job ID
      const jobId = generateJobId();
      
      // Prepare job data for Appwrite
      const jobData = {
        jobId: jobId,
        jobRole: formData.jobRole,
        companyName: formData.companyName,
        description: formData.description,
        stipend: formData.stipend || null,
        duration: formData.duration || null,
        location: formData.location,
        applyLink: formData.applyLink,
        skills: formData.skills,
        site: formData.site,
        jobType: formData.jobType,
        category: formData.category,
        experienceLevel: formData.experienceLevel,
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : null,
        // Additional metadata
        createdAt: new Date().toISOString(),
        createdBy: userEmail,
        status: 'pending' // Can be used for moderation
      };

      // Submit to Appwrite
      await submitToAppwrite(jobData);
      
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting job:', error);
      alert('Failed to submit job posting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitToAppwrite = async (jobData) => {
    try {
      // Initialize Appwrite SDK
      const { Client, Databases, ID } = await import('appwrite');
      
      const client = new Client()
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID);
      
      const databases = new Databases(client);
      
      // Create document in Appwrite
      const response = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        ID.unique(),
        jobData
      );
      
      console.log('✅ Job posted successfully to Appwrite:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to post job to Appwrite:', error);
      throw error;
    }
  };

  const resetForm = () => {
    setFormData({
      jobId: '',
      jobRole: '',
      companyName: '',
      description: '',
      stipend: '',
      duration: '',
      location: 'On site',
      applyLink: '',
      skills: [],
      site: '',
      jobType: 'internship',
      category: 'technology',
      experienceLevel: 'entry',
      applicationDeadline: ''
    });
    setSkillInput('');
    setSubmitSuccess(false);
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FiBriefcase className="text-blue-400 text-xl" />
            <h2 className="text-xl font-semibold text-white">Post New Job</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {submitSuccess ? (
          // Success State
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Job Posted Successfully!</h3>
            <p className="text-gray-300 mb-4">
              Your job posting has been submitted and is pending review.
            </p>
            <p className="text-sm text-gray-400">
              This dialog will close automatically in a few seconds...
            </p>
          </div>
        ) : (
          // Form Content
          <div className="p-6 space-y-6">
            {/* Basic Job Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Role *
                </label>
                <input
                  type="text"
                  value={formData.jobRole}
                  onChange={(e) => handleInputChange('jobRole', e.target.value)}
                  placeholder="e.g., Software Engineer Intern"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 ${
                    errors.jobRole ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.jobRole && <p className="text-red-400 text-xs mt-1">{errors.jobRole}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="e.g., Google"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 ${
                    errors.companyName ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>}
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the job responsibilities, requirements, and what the candidate will be doing..."
                rows={4}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Type
                </label>
                <select
                  value={formData.jobType}
                  onChange={(e) => handleInputChange('jobType', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="internship">Internship</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="technology">Technology</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="finance">Finance</option>
                  <option value="operations">Operations</option>
                  <option value="hr">Human Resources</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Experience Level
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead/Principal</option>
                </select>
              </div>
            </div>

            {/* Location and Compensation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="On site">On site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stipend/Salary
                </label>
                <input
                  type="text"
                  value={formData.stipend}
                  onChange={(e) => handleInputChange('stipend', e.target.value)}
                  placeholder="e.g., $5000/month or Unpaid"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 3 months, Full-time"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Required Skills *
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Enter a skill (e.g., React, Python, Design)"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>

                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm border border-blue-500/30"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-400 hover:text-blue-200"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.skills && <p className="text-red-400 text-xs mt-1">{errors.skills}</p>}
              </div>
            </div>

            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Application Link *
                </label>
                <input
                  type="url"
                  value={formData.applyLink}
                  onChange={(e) => handleInputChange('applyLink', e.target.value)}
                  placeholder="https://company.com/apply or https://linkedin.com/jobs/..."
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 ${
                    errors.applyLink ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.applyLink && <p className="text-red-400 text-xs mt-1">{errors.applyLink}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Site/Source *
                </label>
                <input
                  type="text"
                  value={formData.site}
                  onChange={(e) => handleInputChange('site', e.target.value)}
                  placeholder="e.g., LinkedIn, Indeed, Company Website"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 ${
                    errors.site ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.site && <p className="text-red-400 text-xs mt-1">{errors.site}</p>}
              </div>
            </div>

            {/* Application Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Application Deadline (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.applicationDeadline}
                onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitJob}
                disabled={isSubmitting}
                className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting Job...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Post Job
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Floating Add Job Button Component
const AddNewJobForm = ({ userEmail = '', userName = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          title="Post a new job"
        >
          <FiPlus className="text-xl group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Modal */}
      <AddJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userEmail={userEmail}
        userName={userName}
      />
    </>
  );
};

export default AddNewJobForm;