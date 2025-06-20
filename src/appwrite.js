import { Client, Account, Databases, ID } from 'appwrite';
const client = new Client();

client
  .setEndpoint('https://fra.cloud.appwrite.io/v1') 
  .setProject('6842e9050013dcd9e1bb');   

export const account = new Account(client);
export const databases = new Databases(client);
export { ID }; 


export async function isEmailVerified() {
  try {
    const user = await account.get();
    return user.emailVerification;
  } catch (error) {
    console.error("Error checking email verification:", error);
    return false;
  }
}
export async function sendPasswordRecovery(email) {
  try {
    const resetUrl = `${window.location.origin}/reset-password`;
    await account.createRecovery(email, resetUrl);
    return { success: true };
  } catch (error) {
    console.error("Error sending password recovery:", error);
    throw error;
  }
}

export async function completePasswordRecovery(userId, secret, password) {
  try {
    await account.updateRecovery(userId, secret, password, password);
    return { success: true };
  } catch (error) {
    console.error("Error completing password recovery:", error);
    throw error;
  }
}