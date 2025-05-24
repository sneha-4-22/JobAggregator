import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { current, isVerified, registerWithEmail } = useUser();
  const navigate = useNavigate();

  // Redirect to dashboard if user is already verified
  useEffect(() => {
    if (current && isVerified) {
      navigate('/dashboard');
    }
  }, [current, isVerified, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else if (selectedFile) {
      toast.error('Please upload a PDF file');
      setFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else if (droppedFile) {
      toast.error('Please upload a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a resume PDF file first');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return newProgress;
      });
    }, 100);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('resume', file);

      // Send file to backend for email extraction
      const response = await fetch('http://localhost:5000/api/extract-email', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract email from resume');
      }

      const extractedEmail = data.email;
      
      if (!extractedEmail) {
        throw new Error('No email found in resume');
      }
      
      toast.success(`Email extracted: ${extractedEmail}`);
      setUploadProgress(95);

      // Register user with extracted email using Appwrite
      await registerWithEmail(extractedEmail);
      toast.success('Verification email sent! Please check your inbox');
      
      // Complete progress bar
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to process resume');
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-xl">
        <h1 className="mb-6 text-2xl font-bold text-center text-white">Resume Parser</h1>
        <p className="mb-4 text-sm text-gray-300 text-center">
          Upload your resume to get started. We'll extract your email and send a verification link.
        </p>

        {/* File upload area */}
        <div 
          className="relative flex flex-col items-center justify-center w-full h-40 p-4 mb-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          {file ? (
            <p className="text-sm text-gray-300">{file.name}</p>
          ) : (
            <p className="text-sm text-gray-400">Drag & drop your resume PDF or click to browse</p>
          )}
        </div>

        {/* Progress bar */}
        {uploadProgress > 0 && (
          <div className="w-full h-2 mb-4 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`w-full py-3 px-4 rounded-md text-white font-semibold ${
            !file || isUploading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
        >
          {isUploading ? 'Processing...' : 'Upload Resume'}
        </button>
      </div>
    </div>
  );
};

export default ResumeUpload;