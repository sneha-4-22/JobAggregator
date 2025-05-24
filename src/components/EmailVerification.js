import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';
import { account } from '../appwrite';

const EmailVerification = () => {
  const [verifying, setVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { checkVerificationStatus } = useUser();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setVerifying(true);
        
        // Get URL parameters
        const urlParams = new URLSearchParams(location.search);
        const userId = urlParams.get('userId');
        const secret = urlParams.get('secret');
        
        if (!userId || !secret) {
          throw new Error('Missing verification parameters');
        }
        
        // Confirm verification with Appwrite
        await account.updateVerification(userId, secret);
        
        // Check if verification is successful
        const isVerified = await checkVerificationStatus();
        
        if (isVerified) {
          setVerificationSuccess(true);
          toast.success('Email verification successful!');
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          throw new Error('Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setError(error.message || 'Verification failed');
        toast.error(error.message || 'Verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [location, navigate, checkVerificationStatus]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl text-center">
        <h1 className="text-2xl font-bold text-white mb-6">Email Verification</h1>
        
        {verifying && (
          <div className="mb-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Verifying your email...</p>
          </div>
        )}
        
        {!verifying && verificationSuccess && (
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-400 mb-2">Verification Successful!</h2>
            <p className="text-gray-300 mb-4">
              Your email has been verified successfully. You will be redirected to your dashboard shortly.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-semibold"
            >
              Go to Dashboard
            </button>
          </div>
        )}
        
        {!verifying && error && (
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-400 mb-2">Verification Failed</h2>
            <p className="text-gray-300 mb-4">
              {error}. Please try again or contact support if the issue persists.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-semibold"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;