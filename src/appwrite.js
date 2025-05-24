import { Client, Account } from 'appwrite';

// Initialize Appwrite client
const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
    .setProject('678c78a70025a41f7d95');    // Replace with your project ID

export const account = new Account(client);

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