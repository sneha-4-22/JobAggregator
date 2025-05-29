import { ID } from "appwrite";
import { createContext, useContext, useEffect, useState } from "react";
import { account, isEmailVerified } from "../appwrite";

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  // Register user with email and password (for resume upload flow)
  async function registerWithEmailAndPassword(email, password, name = "Resume User") {
    try {
      // Create the user account
      const newUser = await account.create(ID.unique(), email, password, name);
      console.log("User created successfully:", newUser);

      // Login the user
      await account.createEmailSession(email, password);
      const loggedInUser = await account.get();
      setUser(loggedInUser);

      // Send verification email
      try {
        const url = window.location.origin + '/verify-email';
        await account.createVerification(url);
        console.log("Verification email sent successfully");
      } catch (verifyError) {
        console.error("Failed to send verification email:", verifyError);
      }

      return { userId: newUser.$id, email };
    } catch (error) {
      console.error("Registration error:", error);

      // If user already exists, try to handle that case
      if (error.code === 409) {
        try {
          // Send new verification email for existing user
          await account.createMagicURLSession(ID.unique(), email, window.location.origin + '/verify-email');
          console.log("Magic URL session created for existing user");
          return { message: "User already exists. Verification email sent." };
        } catch (magicLinkError) {
          console.error("Magic link error:", magicLinkError);
          throw new Error("User already exists but couldn't send verification. Please contact support.");
        }
      }

      throw error;
    }
  }

  // Login with email and password (for returning users)
  async function loginWithEmailAndPassword(email, password) {
    try {
      await account.createEmailSession(email, password);
      const loggedInUser = await account.get();
      setUser(loggedInUser);

      // Check verification status
      const verified = await isEmailVerified();
      setIsVerified(verified);

      return { success: true, user: loggedInUser };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Register user with email extracted from resume (legacy function for backward compatibility)
  async function registerWithEmail(email, name = "Resume User") {
    // Generate a random password - in production you might want to improve this
    const randomPassword = Math.random().toString(36).slice(-10) +
      Math.random().toString(36).toUpperCase().slice(-2) +
      Math.floor(Math.random() * 10) +
      "!";

    return await registerWithEmailAndPassword(email, randomPassword, name);
  }

  async function logout() {
    try {
      await account.deleteSession("current");
      setUser(null);
      setIsVerified(false);
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      setIsVerified(false);
    }
  }

  async function checkVerificationStatus() {
    try {
      const verified = await isEmailVerified();
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
      const verified = await isEmailVerified();
      setIsVerified(verified);
    } catch (error) {
      // User is not logged in - this is normal
      setUser(null);
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <UserContext.Provider value={{
      current: user,
      loading,
      isVerified,
      registerWithEmail, // Legacy function
      registerWithEmailAndPassword, // New function for resume upload
      loginWithEmailAndPassword, // New function for login
      logout,
      checkVerificationStatus
    }}>
      {children}
    </UserContext.Provider>
  );
}