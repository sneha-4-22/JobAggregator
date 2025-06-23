// Updated UserContext.jsx with fixed certifications array handling

import { ID, Query } from "appwrite";
import { createContext, useContext, useEffect, useState } from "react";
import { account, databases } from "../appwrite";

// Appwrite configuration
const DATABASE_ID = "gigrithm";
const USERS_COLLECTION_ID = "users";

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Utility function to truncate and optimize data for Appwrite storage
  function optimizeDataForStorage(data, maxLength = 8000) {
    if (typeof data === 'string') {
      return data.length > maxLength ? data.substring(0, maxLength) + '...' : data;
    }
    
    if (Array.isArray(data)) {
      // Convert array to condensed string format
      let result = data.map(item => {
        if (typeof item === 'object') {
          // Create a condensed version of work experience
          if (item.company || item.position || item.title) {
            return `${item.position || item.title || 'Position'} at ${item.company || 'Company'} (${item.duration || item.start_date || 'Duration'})${item.description ? ': ' + (item.description.substring(0, 200) + (item.description.length > 200 ? '...' : '')) : ''}`;
          }
          return JSON.stringify(item);
        }
        return String(item);
      }).join(' | ');
      
      return result.length > maxLength ? result.substring(0, maxLength) + '...' : result;
    }
    
    if (typeof data === 'object' && data !== null) {
      const stringified = JSON.stringify(data);
      return stringified.length > maxLength ? stringified.substring(0, maxLength) + '...' : stringified;
    }
    
    return String(data || '');
  }

  // Enhanced function to extract key skills with limits
  function extractKeySkills(skills, maxSkills = 20) {
    if (!Array.isArray(skills)) return [];
    
    // Prioritize skills and limit to top skills
    return skills
      .slice(0, maxSkills)
      .map(skill => typeof skill === 'string' ? skill : skill.name || String(skill))
      .filter(skill => skill && skill.length > 0);
  }

  // New function to handle certifications array properly
  function extractCertifications(certifications, maxCertifications = 15) {
    if (!certifications) return [];
    
    if (Array.isArray(certifications)) {
      return certifications
        .slice(0, maxCertifications)
        .map(cert => {
          if (typeof cert === 'string') {
            return cert;
          } else if (typeof cert === 'object' && cert !== null) {
            return cert.name || cert.title || cert.certification || String(cert);
          }
          return String(cert);
        })
        .filter(cert => cert && cert.length > 0);
    }
    
    if (typeof certifications === 'string') {
      // Try to parse if it's a JSON string
      try {
        const parsed = JSON.parse(certifications);
        if (Array.isArray(parsed)) {
          return extractCertifications(parsed, maxCertifications);
        }
      } catch (e) {
        // If not JSON, treat as single certification
        return [certifications];
      }
    }
    
    return [];
  }

  // Process resume with Flask API
  async function processResumeWithAPI(resumeFile) {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await fetch('https://gigi-back.onrender.com/api/analyze-resume', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to process resume');
      }

      const data = await response.json();

      if (data.success) {
        return data.analysis;
      } else {
        throw new Error(data.error || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error("Error processing resume with API:", error);
      throw error;
    }
  }

  // Create comprehensive user profile in Appwrite database
  async function createUserProfile(user, email, resumeData) {
    try {
      // Optimize all data fields for Appwrite string limits
      const userProfile = {
        userId: user.$id,
        email: email,
        name: resumeData?.name || 'User',
        createdAt: new Date().toISOString(),
        isVerified: false,
        lastLogin: new Date().toISOString(),
        hasResume: true,
        profileComplete: true,
        
        // Basic resume data fields - optimized for string storage
        phone: resumeData?.phone || '',
        location: resumeData?.location_preference || 'flexible',
        experience_level: resumeData?.experience_level || 'entry',
        education: optimizeDataForStorage(resumeData?.education, 2000),
        summary: optimizeDataForStorage(resumeData?.summary, 3000),
        
        // Optimized arrays stored as condensed strings
        skills: extractKeySkills(resumeData?.skills),
        work_experience: optimizeDataForStorage(resumeData?.work_experience, 7000), // Reduced limit for work experience
        projects: optimizeDataForStorage(resumeData?.projects, 2000),
        certifications: extractCertifications(resumeData?.certifications), // Fixed: Keep as array
        languages: (resumeData?.languages || []).slice(0, 10),
        
        // Computed fields
        profileCompleteness: calculateProfileCompleteness(resumeData),
        totalExperience: calculateTotalExperience(resumeData?.work_experience || []),
        skillsCount: Math.min((resumeData?.skills || []).length, 20),
        projectsCount: Math.min((resumeData?.projects || []).length, 10),
        completenessScore: calculateResumeCompleteness(resumeData),
        
        // Resume metadata
        originalFileName: resumeData?.originalFileName || '',
        resumeUploadedAt: new Date().toISOString(),
        resumeVersion: 1,
        
        // Account settings
        accountType: 'jobseeker',
        isActive: true,
        preferences: JSON.stringify({
          jobAlerts: true,
          emailNotifications: true,
          profileVisibility: 'public'
        })
      };

      console.log("Creating user profile with optimized data...");
      
      const userDoc = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        userProfile
      );

      setUserProfile(userDoc);
      setHasResume(true);
      console.log("Comprehensive user profile created in database");
      return userDoc;
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  }

  // Alternative: Use Gemini API for resume processing (if your Flask API fails)
  async function processResumeWithGemini(resumeFile) {
    try {
      // Convert PDF to text first (you'd need a PDF parser)
      const formData = new FormData();
      formData.append('file', resumeFile);
      
      // This would call your backend that uses Gemini API
      const response = await fetch('https://gigi-back.onrender.com/api/gemini-analyze-resume', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to process resume with Gemini');
      }

      const data = await response.json();
      return data.analysis;
    } catch (error) {
      console.error("Error processing resume with Gemini:", error);
      throw error;
    }
  }

  // Main registration function with resume processing and fallback
  async function registerWithResumeAndPassword(email, password, resumeFile, name = "Resume User") {
    try {
      setLoading(true);
      
      let resumeAnalysis;
      
      try {
        // Step 1: Try processing with your current API
        console.log("Processing resume with main API...");
        resumeAnalysis = await processResumeWithAPI(resumeFile);
      } catch (apiError) {
        console.log("Main API failed, trying Gemini fallback...");
        // Fallback to Gemini API if available
        try {
          resumeAnalysis = await processResumeWithGemini(resumeFile);
        } catch (geminiError) {
          console.log("Gemini API also failed, using basic extraction...");
          // Final fallback: create basic profile
          resumeAnalysis = {
            name: name,
            email: email,
            skills: [],
            work_experience: [],
            projects: [],
            education: "Education details will be updated later",
            summary: "Profile created from resume upload",
            experience_level: "entry"
          };
        }
      }
      
      // Step 2: Create the user account
      console.log("Creating user account...");
      const extractedName = resumeAnalysis.name || name;
      const newUser = await account.create(ID.unique(), email, password, extractedName);
      console.log("User created successfully:", newUser);

      // Step 3: Login the user immediately
      await account.createEmailSession(email, password);
      const loggedInUser = await account.get();
      setUser(loggedInUser);

      // Step 4: Create user profile with optimized resume data
      console.log("Creating user profile with optimized resume data...");
      resumeAnalysis.originalFileName = resumeFile.name;
      await createUserProfile(loggedInUser, email, resumeAnalysis);

      // Step 5: Send verification email
      try {
        const url = window.location.origin + '/verify-email';
        await account.createVerification(url);
        console.log("Verification email sent successfully");
      } catch (verifyError) {
        console.error("Failed to send verification email:", verifyError);
      }

      return { 
        userId: newUser.$id, 
        email, 
        resumeProcessed: true,
        message: "Account created successfully with resume data"
      };
    } catch (error) {
      console.error("Registration with resume error:", error);

      // Handle existing user case
      if (error.code === 409) {
        throw new Error("User already exists with this email. Please try logging in instead.");
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }
async function sendPasswordRecoveryEmail(email) {
  try {
    const resetUrl = `${window.location.origin}/reset-password`;
    await account.createRecovery(email, resetUrl);
    return { success: true, message: "Password recovery email sent successfully" };
  } catch (error) {
    console.error("Password recovery error:", error);
    throw error;
  }
}

// Complete password recovery
async function resetPassword(userId, secret, newPassword) {
  try {
    await account.updateRecovery(userId, secret, newPassword, newPassword);
    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
}
  // Login with email and password
  async function loginWithEmailAndPassword(email, password) {
    try {
      setLoading(true);
      
      await account.createEmailSession(email, password);
      const loggedInUser = await account.get();
      setUser(loggedInUser);

      // Check verification status
      const verified = await checkEmailVerification();
      setIsVerified(verified);

      // Load user's complete profile
      await loadUserCompleteProfile(loggedInUser.$id);

      // Update last login
      await updateLastLogin(loggedInUser.$id);

      return { success: true, user: loggedInUser };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Load user's complete profile from Appwrite
  async function loadUserCompleteProfile(userId) {
    try {
      const userResponse = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      if (userResponse.documents.length > 0) {
        const userDoc = userResponse.documents[0];
        
        // Parse JSON strings back to arrays/objects for frontend use
        if (userDoc.skills && typeof userDoc.skills === 'string') {
          try {
            userDoc.skills = JSON.parse(userDoc.skills);
          } catch (e) {
            userDoc.skills = [];
          }
        }
        
        if (userDoc.languages && typeof userDoc.languages === 'string') {
          try {
            userDoc.languages = JSON.parse(userDoc.languages);
          } catch (e) {
            userDoc.languages = [];
          }
        }
        
        if (userDoc.preferences && typeof userDoc.preferences === 'string') {
          try {
            userDoc.preferences = JSON.parse(userDoc.preferences);
          } catch (e) {
            userDoc.preferences = {};
          }
        }
        
        // Ensure certifications is always an array
        if (userDoc.certifications && !Array.isArray(userDoc.certifications)) {
          if (typeof userDoc.certifications === 'string') {
            try {
              userDoc.certifications = JSON.parse(userDoc.certifications);
            } catch (e) {
              userDoc.certifications = [userDoc.certifications];
            }
          } else {
            userDoc.certifications = [];
          }
        }
        
        setUserProfile(userDoc);
        setHasResume(userDoc.hasResume || false);
        console.log("User profile loaded from database");
        return true;
      } else {
        setHasResume(false);
        setUserProfile(null);
        console.log("No user profile found");
        return false;
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      setHasResume(false);
      setUserProfile(null);
      return false;
    }
  }

  // Update last login timestamp
  async function updateLastLogin(userId) {
    try {
      const userResponse = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      if (userResponse.documents.length > 0) {
        const userDoc = userResponse.documents[0];
        await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userDoc.$id,
          { lastLogin: new Date().toISOString() }
        );
      }
    } catch (error) {
      console.error("Error updating last login:", error);
    }
  }

  // Check email verification status
  async function checkEmailVerification() {
    try {
      const user = await account.get();
      return user.emailVerification;
    } catch (error) {
      console.error("Error checking verification:", error);
      return false;
    }
  }

  // Update resume data with optimization
  async function updateResumeData(newResumeFile = null, updatedData = null) {
    try {
      if (!user) throw new Error("User not logged in");

      let resumeAnalysis = updatedData;
      
      if (newResumeFile) {
        try {
          resumeAnalysis = await processResumeWithAPI(newResumeFile);
        } catch {
          // Try Gemini fallback
          try {
            resumeAnalysis = await processResumeWithGemini(newResumeFile);
          } catch {
            throw new Error("Failed to process resume with both APIs");
          }
        }
      }

      if (!resumeAnalysis) throw new Error("No resume data to update");

      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );

      if (response.documents.length > 0) {
        const existingDoc = response.documents[0];
        const currentVersion = existingDoc.resumeVersion || 1;
        
        const updatedProfile = await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          existingDoc.$id,
          {
            // Update resume fields with optimization
            name: resumeAnalysis.name || existingDoc.name,
            phone: resumeAnalysis.phone || existingDoc.phone,
            location: resumeAnalysis.location_preference || existingDoc.location,
            experience_level: resumeAnalysis.experience_level || existingDoc.experience_level,
            education: optimizeDataForStorage(resumeAnalysis.education, 2000),
            summary: optimizeDataForStorage(resumeAnalysis.summary, 3000),
            skills: extractKeySkills(resumeAnalysis.skills),
            work_experience: optimizeDataForStorage(resumeAnalysis.work_experience, 7000),
            projects: optimizeDataForStorage(resumeAnalysis.projects, 2000),
            certifications: extractCertifications(resumeAnalysis.certifications), // Fixed: Keep as array
            languages: (resumeAnalysis.languages || []).slice(0, 10),
            
            // Update computed fields
            profileCompleteness: calculateProfileCompleteness(resumeAnalysis),
            totalExperience: calculateTotalExperience(resumeAnalysis.work_experience || []),
            skillsCount: Math.min((resumeAnalysis.skills || []).length, 20),
            projectsCount: Math.min((resumeAnalysis.projects || []).length, 10),
            completenessScore: calculateResumeCompleteness(resumeAnalysis),
            
            // Update metadata
            originalFileName: newResumeFile?.name || existingDoc.originalFileName,
            resumeUploadedAt: new Date().toISOString(),
            resumeVersion: currentVersion + 1,
            hasResume: true,
            profileComplete: true
          }
        );
        
        setUserProfile(updatedProfile);
        setHasResume(true);
        
        console.log("Resume data updated successfully");
        return updatedProfile;
      }
    } catch (error) {
      console.error("Error updating resume data:", error);
      throw error;
    }
  }

  function calculateTotalExperience(workExperience) {
    if (!workExperience || workExperience.length === 0) return 0;
    return Array.isArray(workExperience) ? workExperience.length : 1;
  }

  function calculateResumeCompleteness(resumeData) {
    if (!resumeData) return 0;

    const fields = [
      resumeData.name,
      resumeData.email,
      resumeData.phone,
      resumeData.skills?.length > 0,
      resumeData.education,
      resumeData.work_experience?.length > 0,
      resumeData.summary,
      resumeData.location_preference
    ];

    const completedFields = fields.filter(field => 
      field && field !== 'Not specified' && field !== 'flexible'
    ).length;
    
    return Math.round((completedFields / fields.length) * 100);
  }

  function calculateProfileCompleteness(resumeData) {
    return calculateResumeCompleteness(resumeData);
  }

  function isProfileComplete() {
    return hasResume && userProfile && userProfile.name && 
           userProfile.skills && Array.isArray(userProfile.skills) && userProfile.skills.length > 0 &&
           userProfile.completenessScore >= 70;
  }

  function getUserStats() {
    if (!userProfile) return null;

    return {
      skillsCount: userProfile.skillsCount || 0,
      experienceLevel: userProfile.experience_level || 'entry',
      projectsCount: userProfile.projectsCount || 0,
      workExperienceCount: Array.isArray(userProfile.work_experience) ? userProfile.work_experience.length : 1,
      certificationsCount: Array.isArray(userProfile.certifications) ? userProfile.certifications.length : 0,
      languagesCount: Array.isArray(userProfile.languages) ? userProfile.languages.length : 0,
      profileCompleteness: userProfile.completenessScore || 0,
      totalExperience: userProfile.totalExperience || 0,
      lastUpdated: userProfile.resumeUploadedAt
    };
  }

  function getDashboardData() {
    if (!userProfile) return null;

    return {
      user: {
        name: userProfile.name,
        email: userProfile.email,
        joinedDate: userProfile.createdAt,
        lastLogin: userProfile.lastLogin,
        isVerified: isVerified,
        accountType: userProfile.accountType || 'jobseeker'
      },
      profile: {
        completeness: userProfile.completenessScore || 0,
        location: userProfile.location || 'flexible',
        experienceLevel: userProfile.experience_level || 'entry',
        summary: userProfile.summary || ''
      },
      stats: getUserStats(),
      resume: {
        fileName: userProfile.originalFileName,
        uploadedAt: userProfile.resumeUploadedAt,
        version: userProfile.resumeVersion || 1
      }
    };
  }

  async function logout() {
    try {
      await account.deleteSession("current");
      setUser(null);
      setIsVerified(false);
      setHasResume(false);
      setUserProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Clear state anyway
      setUser(null);
      setIsVerified(false);
      setHasResume(false);
      setUserProfile(null);
    }
  }
const saveJobActivity = async (jobId) => {
  try {
    if (!user) return;
    
    const userId = user.$id;
    
    let activityDoc;
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        'user_activity', 
        [Query.equal('userId', userId)]
      );
      activityDoc = result.documents[0];
    } catch (error) {
      console.log('No existing activity document found');
    }

    if (activityDoc) {
      const activities = [];
      for (let i = 1; i <= 10; i++) {
        const activity = activityDoc[`recent_activity_${i}`];
        if (activity && activity !== '0') {
          activities.push(activity);
        }
      }
      activities.unshift(jobId);
      
      const updatedActivities = activities.slice(0, 10);
      
      const updateData = { userId };
      for (let i = 1; i <= 10; i++) {
        updateData[`recent_activity_${i}`] = updatedActivities[i - 1] || '0';
      }
      
      await databases.updateDocument(
        DATABASE_ID,
        'user_activity',
        activityDoc.$id,
        updateData
      );
    } else {
      const newData = { userId };
      newData['recent_activity_1'] = jobId;
      for (let i = 2; i <= 10; i++) {
        newData[`recent_activity_${i}`] = '0';
      }
      
      await databases.createDocument(
        DATABASE_ID,
        'user_activity',
        ID.unique(),
        newData
      );
    }
    
    console.log('Job activity saved successfully');
  } catch (error) {
    console.error('Error saving job activity:', error);
  }
};
  async function checkVerificationStatus() {
    try {
      const verified = await checkEmailVerification();
      setIsVerified(verified);
      return verified;
    } catch (error) {
      console.error("Error checking verification:", error);
      return false;
    }
  }

  async function init() {
    try {
      setLoading(true);
      const loggedInUser = await account.get();
      setUser(loggedInUser);

      // Check verification status
      const verified = await checkEmailVerification();
      setIsVerified(verified);

      // Load complete profile
      await loadUserCompleteProfile(loggedInUser.$id);
    } catch (error) {
      // User is not logged in - this is normal
      setUser(null);
      setIsVerified(false);
      setHasResume(false);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <UserContext.Provider value={{
      // User state
      current: user,
      loading,
      isVerified,
      hasResume,
      userProfile,
      
      // Authentication functions
      registerWithResumeAndPassword,
      loginWithEmailAndPassword,
      logout,
      checkVerificationStatus,
      
      // Data functions
      loadUserCompleteProfile,
      updateResumeData,
      getDashboardData,
      getUserStats,
      isProfileComplete,
      sendPasswordRecoveryEmail,
      resetPassword,
      // Utility functions
      saveJobActivity,
      processResumeWithAPI,
      processResumeWithGemini
    }}>
      {children}
    </UserContext.Provider>
  );
}