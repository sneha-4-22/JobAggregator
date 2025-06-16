import { Client, Account, Databases, ID } from 'appwrite';

// Initialize Appwrite client
const client = new Client();

client
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
  .setProject('6842e9050013dcd9e1bb');    // Replace with your project ID

export const account = new Account(client);
export const databases = new Databases(client);
export { ID }; // Export ID utility

// Function to check if user's email is verified
export async function isEmailVerified() {
  try {
    const user = await account.get();
    return user.emailVerification;
  } catch (error) {
    console.error("Error checking email verification:", error);
    return false;
  }
}