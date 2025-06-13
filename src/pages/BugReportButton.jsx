import React, { useState } from 'react';
import { 
  Bug as FiBug, 
  X as FiX, 
  Upload as FiUpload, 
  Send as FiSend, 
  Lightbulb as FiLightbulb,
  MessageSquare as FiMessageSquare,
  Trash2 as FiTrash2,
  Check as FiCheck
} from 'lucide-react';
// Main Bug Report Modal Component
const BugReportModal = ({ isOpen, onClose, userEmail = '', userName = '' }) => {
  const [formData, setFormData] = useState({
    type: 'bug', 
    title: '',
    description: '',
    steps: '',
    expected: '',
    actual: '',
    browser: '',
    deviceInfo: '',
    urgency: 'medium',
    category: 'general',
    contactEmail: userEmail,
    contactName: userName,
    allowContact: true
  });

  const [screenshots, setScreenshots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Auto-detect browser and device info
  React.useEffect(() => {
    if (isOpen) {
      const browserInfo = navigator.userAgent;
      const deviceInfo = {
        platform: navigator.platform,
        language: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      };
      
      setFormData(prev => ({
        ...prev,
        browser: browserInfo,
        deviceInfo: JSON.stringify(deviceInfo, null, 2)
      }));
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) { // 5MB limit
        const reader = new FileReader();
        reader.onload = (e) => {
          setScreenshots(prev => [...prev, {
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload images only (max 5MB each)');
      }
    });
    
    event.target.value = '';
  };

  const removeScreenshot = (id) => {
    setScreenshots(prev => prev.filter(img => img.id !== id));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.type === 'bug' && !formData.steps.trim()) {
      newErrors.steps = 'Steps to reproduce are required for bug reports';
    }
    
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitReport = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert screenshots to base64 for email
      const screenshotData = await Promise.all(
        screenshots.map(async (screenshot) => ({
          name: screenshot.name,
          data: screenshot.preview.split(',')[1], // Remove data:image/jpeg;base64, prefix
          type: screenshot.file.type
        }))
      );

      const reportData = {
        ...formData,
        screenshots: screenshotData,
        submittedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      };

      // Here you would integrate with your backend/email service
      // For now, we'll simulate the API call
      await simulateSubmission(reportData);
      
      setSubmitSuccess(true);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulate API submission - replace with your actual API call
  const simulateSubmission = async (reportData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Here you would send the data to your backend
        // which would then email it to gigrithm.ai@gmail.com
        console.log('Report submitted:', reportData);
        resolve();
      }, 2000);
    });
  };

  const resetForm = () => {
    setFormData({
      type: 'bug',
      title: '',
      description: '',
      steps: '',
      expected: '',
      actual: '',
      browser: '',
      deviceInfo: '',
      urgency: 'medium',
      category: 'general',
      contactEmail: userEmail,
      contactName: userName,
      allowContact: true
    });
    setScreenshots([]);
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
            {formData.type === 'bug' && <FiBug className="text-red-400 text-xl" />}
            {formData.type === 'feature' && <FiLightbulb className="text-yellow-400 text-xl" />}
            {formData.type === 'feedback' && <FiMessageSquare className="text-blue-400 text-xl" />}
            <h2 className="text-xl font-semibold text-white">
              {formData.type === 'bug' && 'Report a Bug'}
              {formData.type === 'feature' && 'Request a Feature'}
              {formData.type === 'feedback' && 'Send Feedback'}
            </h2>
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
            <h3 className="text-xl font-semibold text-white mb-2">Report Submitted Successfully!</h3>
            <p className="text-gray-300 mb-4">
              Thank you for your {formData.type}. We&#39;ll review it and get back to you if needed.
            </p>
            <p className="text-sm text-gray-400">
              This dialog will close automatically in a few seconds...
            </p>
          </div>
        ) : (
          // Form Content
          <div className="p-6 space-y-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                What would you like to report?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { type: 'bug', icon: FiBug, label: 'Bug Report', color: 'red', desc: 'Something is broken or not working' },
                  { type: 'feature', icon: FiLightbulb, label: 'Feature Request', color: 'yellow', desc: 'Suggest a new feature or improvement' },
                  { type: 'feedback', icon: FiMessageSquare, label: 'General Feedback', color: 'blue', desc: 'Share your thoughts or suggestions' }
                ].map(({ type, icon: Icon, label, color, desc }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange('type', type)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.type === type
                        ? `border-${color}-500 bg-${color}-900/20`
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <Icon className={`text-${color}-400 mb-2`} size={20} />
                    <h4 className="font-medium text-white text-sm">{label}</h4>
                    <p className="text-xs text-gray-400 mt-1">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={`Brief ${formData.type} title`}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 ${
                    errors.title ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
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
                  <option value="general">General</option>
                  <option value="ui">User Interface</option>
                  <option value="performance">Performance</option>
                  <option value="mobile">Mobile</option>
                  <option value="search">Job Search</option>
                  <option value="profile">Profile Management</option>
                  <option value="authentication">Login/Registration</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={
                  formData.type === 'bug' 
                    ? 'Describe the bug you encountered...'
                    : formData.type === 'feature'
                    ? 'Describe the feature you would like to see...'
                    : 'Share your feedback with us...'
                }
                rows={4}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Bug-specific fields */}
            {formData.type === 'bug' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Steps to Reproduce *
                  </label>
                  <textarea
                    value={formData.steps}
                    onChange={(e) => handleInputChange('steps', e.target.value)}
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                    rows={3}
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-none ${
                      errors.steps ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {errors.steps && <p className="text-red-400 text-xs mt-1">{errors.steps}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Expected Behavior
                    </label>
                    <textarea
                      value={formData.expected}
                      onChange={(e) => handleInputChange('expected', e.target.value)}
                      placeholder="What should happen?"
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Actual Behavior
                    </label>
                    <textarea
                      value={formData.actual}
                      onChange={(e) => handleInputChange('actual', e.target.value)}
                      placeholder="What actually happens?"
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Urgency Level
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => handleInputChange('urgency', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  >
                    <option value="low">Low - Minor issue</option>
                    <option value="medium">Medium - Affects some functionality</option>
                    <option value="high">High - Major functionality broken</option>
                    <option value="critical">Critical - App unusable</option>
                  </select>
                </div>
              </div>
            )}

            {/* Screenshots */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Screenshots (Optional)
              </label>
              <div className="space-y-3">
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                  <div className="flex flex-col items-center">
                    <FiUpload className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-400">
                      Click to upload images (PNG, JPG, GIF - Max 5MB each)
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {screenshots.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {screenshots.map((screenshot) => (
                      <div key={screenshot.id} className="relative">
                        <img
                          src={screenshot.preview}
                          alt={screenshot.name}
                          className="w-full h-24 object-cover rounded-lg border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeScreenshot(screenshot.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                        >
                          <FiTrash2 size={12} />
                        </button>
                        <p className="text-xs text-gray-400 mt-1 truncate">{screenshot.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="your.email@example.com"
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 ${
                      errors.contactEmail ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {errors.contactEmail && <p className="text-red-400 text-xs mt-1">{errors.contactEmail}</p>}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowContact"
                  checked={formData.allowContact}
                  onChange={(e) => handleInputChange('allowContact', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="allowContact" className="text-sm text-gray-300">
                  Allow Gigrithm team to contact me for follow-up questions
                </label>
              </div>
            </div>

            {/* System Information (Auto-detected, collapsed) */}
            <details className="bg-gray-700/30 rounded-lg p-4">
              <summary className="text-sm font-medium text-gray-300 cursor-pointer">
                System Information (Auto-detected)
              </summary>
              <div className="mt-3 text-xs text-gray-400 font-mono whitespace-pre-wrap">
                <strong>Browser:</strong> {formData.browser}
                <br />
                <strong>Device Info:</strong>
                <br />
                {formData.deviceInfo}
              </div>
            </details>

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
                onClick={submitReport}
                disabled={isSubmitting}
                className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Submit {formData.type === 'bug' ? 'Bug Report' : formData.type === 'feature' ? 'Feature Request' : 'Feedback'}
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

// Floating Bug Report Button Component - THIS IS WHAT YOU IMPORT
const BugReportButton = ({ userEmail = '', userName = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          {/* Main Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-14 h-14 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            title="Report a bug or request a feature"
          >
            <FiBug className="text-xl group-hover:scale-110 transition-transform" />
          </button>

          {/* Expanded Options */}
          {isExpanded && (
            <div className="absolute bottom-16 right-0 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-2 min-w-48 animate-fadeIn">
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsExpanded(false);
                }}
                className="w-full flex items-center px-3 py-2 text-left text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiBug className="mr-3 text-red-400" />
                <div>
                  <div className="font-medium">Report Bug</div>
                  <div className="text-xs text-gray-400">Something&#39;s broken?</div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsExpanded(false);
                }}
                className="w-full flex items-center px-3 py-2 text-left text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiLightbulb className="mr-3 text-yellow-400" />
                <div>
                  <div className="font-medium">Request Feature</div>
                  <div className="text-xs text-gray-400">Have an idea?</div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsExpanded(false);
                }}
                className="w-full flex items-center px-3 py-2 text-left text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiMessageSquare className="mr-3 text-blue-400" />
                <div>
                  <div className="font-medium">Give Feedback</div>
                  <div className="text-xs text-gray-400">Share your thoughts</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <BugReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userEmail={userEmail}
        userName={userName}
      />

      {/* Click outside to close expanded menu */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default BugReportButton;