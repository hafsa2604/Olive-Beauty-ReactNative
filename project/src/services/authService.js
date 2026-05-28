import { apiClient } from './apiClient';
import { saveJson } from '@/lib/storage';

export const ADMIN_EMAIL = 'admin@olivebeauty.com';
export const ADMIN_PASSWORD = 'admin123';

/**
 * Registers a new customer using the REST API.
 */
export async function signUpUser(name, email, password) {
  const payload = { name, email, password };
  try {
    const userData = await apiClient.post('/api/auth/register', payload);
    
    // Save session in local storage for persistence
    await saveJson('@olivebeauty/session', userData);
    
    return userData;
  } catch (error) {
    console.error('API signUpUser error:', error);
    // Wrap to match standard Firebase error codes if relevant
    const err = new Error(error.message);
    err.code = error.code || 'auth/signup-failed';
    throw err;
  }
}

/**
 * Authenticates a user or admin using the REST API.
 */
export async function loginUser(email, password) {
  const payload = { email, password };
  try {
    const userData = await apiClient.post('/api/auth/login', payload);
    
    // Save session in local storage for persistence
    await saveJson('@olivebeauty/session', userData);
    
    return userData;
  } catch (error) {
    console.error('API loginUser error:', error);
    const err = new Error(error.message);
    err.code = error.code || 'auth/login-failed';
    throw err;
  }
}

/**
 * Sign out of current session.
 */
export async function logoutUser() {
  // Clear local session storage
  await saveJson('@olivebeauty/session', null);
}

/**
 * Sends a password reset email via the REST API.
 */
export async function sendPasswordReset(email) {
  try {
    await apiClient.post('/api/auth/reset-password', { email });
  } catch (error) {
    console.error('API sendPasswordReset error:', error);
    const err = new Error(error.message);
    err.code = error.code || 'auth/reset-failed';
    throw err;
  }
}

/**
 * Fetches user profile from Firestore via the REST API.
 */
export async function fetchUserProfile(uid) {
  try {
    return await apiClient.get(`/api/users/${uid}`);
  } catch (error) {
    console.error('API fetchUserProfile error:', error);
    return null;
  }
}

/**
 * Updates user profile details in Firestore via the REST API.
 */
export async function updateUserProfile(uid, updates) {
  try {
    const updatedProfile = await apiClient.put(`/api/users/${uid}`, updates);
    
    // Refresh local session storage
    await saveJson('@olivebeauty/session', updatedProfile);
    
    return updatedProfile;
  } catch (error) {
    console.error('API updateUserProfile error:', error);
    throw error;
  }
}
