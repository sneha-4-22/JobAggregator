import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import ResumeUpload from './components/ResumeUpload';
import Dashboard from './components/Dashboard';
import EmailVerification from './components/EmailVerification';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<ResumeUpload />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;