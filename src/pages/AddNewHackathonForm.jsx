import {
    Award as FiAward,
    Check as FiCheck,
    Plus as FiPlus,
    Send as FiSend,
    X as FiX
} from 'lucide-react';
import { useState } from 'react';
import { ID, databases } from '../appwrite';

const AddHackathonModal = ({ isOpen, onClose, userEmail = '', userName = '' }) => {
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    description: '',
    prize: '',
    mode: 'online',
    registration_deadline: '',
    submission_deadline: '',
    start_date: '',
    participation_link: '',
    location: '',
    themes: []
  });

  const [themeInput, setThemeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const APPWRITE_DATABASE_ID = 'gigrithm'; 
  const APPWRITE_COLLECTION_ID = 'hackathon';

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

  const addTheme = () => {
    if (themeInput.trim() && !formData.themes.includes(themeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        themes: [...prev.themes, themeInput.trim()]
      }));
      setThemeInput('');
    }
  };

  const removeTheme = (themeToRemove) => {
    setFormData(prev => ({
      ...prev,
      themes: prev.themes.filter(theme => theme !== themeToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Hackathon title is required';
    }
    
    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Hackathon description is required';
    }
    
    if (!formData.participation_link.trim()) {
      newErrors.participation_link = 'Participation link is required';
    } else if (!/^https?:\/\/.+/.test(formData.participation_link)) {
      newErrors.participation_link = 'Please enter a valid URL (starting with http:// or https://)';
    }
    
    if (!formData.start_date.trim()) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.registration_deadline.trim()) {
      newErrors.registration_deadline = 'Registration deadline is required';
    }
    
    if (formData.themes.length === 0) {
      newErrors.themes = 'At least one theme is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateHackathonId = () => {
    return `HACK-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  };

  const submitHackathon = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const hackathonId = generateHackathonId();
      
      const hackathonData = {
        hackathonId: hackathonId,
        title: formData.title,
        organization: formData.organization,
        description: formData.description,
        prize: formData.prize || null,
        mode: formData.mode,
        registration_deadline: new Date(formData.registration_deadline).toISOString(),
        submission_deadline: formData.submission_deadline ? new Date(formData.submission_deadline).toISOString() : null,
        start_date: new Date(formData.start_date).toISOString(),
        participation_link: formData.participation_link,
        location: formData.location || null,
        themes: formData.themes,
        // Additional metadata
        createdAt: new Date().toISOString(),
        createdBy: userEmail,
        status: 'pending' 
      };
      await submitToAppwrite(hackathonData);
      
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting hackathon:', error);
      alert('Failed to submit hackathon posting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitToAppwrite = async (hackathonData) => {
    try {
      // Create document in Appwrite using your existing client
      const response = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        ID.unique(),
        hackathonData
      );
      
      console.log('✅ Hackathon posted successfully to Appwrite:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to post hackathon to Appwrite:', error);
      throw error;
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      organization: '',
      description: '',
      prize: '',
      mode: 'online',
      registration_deadline: '',
      submission_deadline: '',
      start_date: '',
      participation_link: '',
      location: '',
      themes: []
    });
    setThemeInput('');
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
            <FiAward className="text-purple-400 text-xl" />
            <h2 className="text-xl font-semibold text-white">Post New Hackathon</h2>
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
            <h3 className="text-xl font-semibold text-white mb-2">Hackathon Posted Successfully!</h3>
            <p className="text-gray-300 mb-4">
              Your hackathon posting has been submitted and is pending review.
            </p>
            <p className="text-sm text-gray-400">
              This dialog will close automatically in a few seconds...
            </p>
          </div>
        ) : (
          // Form Content
          <div className="p-6 space-y-6">
            {/* Basic Hackathon Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hackathon Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., AI Innovation Challenge 2025"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 ${
                    errors.title ? 'border-purple-500' : 'border-gray-600'
                  }`}
                />
                {errors.title && <p className="text-purple-400 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Organization *
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  placeholder="e.g., Google Developer Groups"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 ${
                    errors.organization ? 'border-purple-500' : 'border-gray-600'
                  }`}
                />
                {errors.organization && <p className="text-purple-400 text-xs mt-1">{errors.organization}</p>}
              </div>
            </div>

            {/* Hackathon Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hackathon Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the hackathon theme, objectives, what participants will build, and any special features..."
                rows={4}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none ${
                  errors.description ? 'border-purple-500' : 'border-gray-600'
                }`}
              />
              {errors.description && <p className="text-purple-400 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Mode and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mode
                </label>
                <select
                  value={formData.mode}
                  onChange={(e) => handleInputChange('mode', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., New York, NY or Virtual"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Prize */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prize Pool
              </label>
              <input
                type="text"
                value={formData.prize}
                onChange={(e) => handleInputChange('prize', e.target.value)}
                placeholder="e.g., $10,000 in prizes or Cash prizes + Swag"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white ${
                    errors.start_date ? 'border-purple-500' : 'border-gray-600'
                  }`}
                />
                {errors.start_date && <p className="text-purple-400 text-xs mt-1">{errors.start_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Registration Deadline *
                </label>
                <input
                  type="datetime-local"
                  value={formData.registration_deadline}
                  onChange={(e) => handleInputChange('registration_deadline', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white ${
                    errors.registration_deadline ? 'border-purple-500' : 'border-gray-600'
                  }`}
                />
                {errors.registration_deadline && <p className="text-purple-400 text-xs mt-1">{errors.registration_deadline}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Submission Deadline
                </label>
                <input
                  type="datetime-local"
                  value={formData.submission_deadline}
                  onChange={(e) => handleInputChange('submission_deadline', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                />
              </div>
            </div>

            {/* Themes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hackathon Themes *
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={themeInput}
                    onChange={(e) => setThemeInput(e.target.value)}
                    placeholder="Enter a theme (e.g., AI/ML, Web Development, Mobile Apps)"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTheme())}
                  />
                  <button
                    type="button"
                    onClick={addTheme}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>

                {formData.themes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.themes.map((theme, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm border border-purple-500/30"
                      >
                        {theme}
                        <button
                          type="button"
                          onClick={() => removeTheme(theme)}
                          className="ml-2 text-purple-400 hover:text-purple-200"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.themes && <p className="text-purple-400 text-xs mt-1">{errors.themes}</p>}
              </div>
            </div>

            {/* Participation Link */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Participation Link *
              </label>
              <input
                type="url"
                value={formData.participation_link}
                onChange={(e) => handleInputChange('participation_link', e.target.value)}
                placeholder="https://hackathon-platform.com/register or https://devpost.com/..."
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 ${
                  errors.participation_link ? 'border-purple-500' : 'border-gray-600'
                }`}
              />
              {errors.participation_link && <p className="text-purple-400 text-xs mt-1">{errors.participation_link}</p>}
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
                onClick={submitHackathon}
                disabled={isSubmitting}
                className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting Hackathon...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Post Hackathon
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


const AddNewHackathonForm = ({ userEmail = '', userName = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center group"
          title="Post a new hackathon"
        >
          <FiPlus className="text-xl group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Modal */}
      <AddHackathonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userEmail={userEmail}
        userName={userName}
      />
    </>
  );
};

export default AddNewHackathonForm;