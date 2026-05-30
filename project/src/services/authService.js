import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '@/constants/auth';
import { auth, db } from './firebaseConfig';

export { ADMIN_EMAIL, ADMIN_PASSWORD };

/**
 * Registers a new customer in Firebase Auth and Firestore.
 */
export async function signUpUser(name, email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (normalizedEmail === ADMIN_EMAIL) {
    const err = new Error('This email is reserved for admin access. Sign in from the login screen instead.');
    err.code = 'auth/admin-email-reserved';
    throw err;
  }

  // Create user in Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
  const uid = userCredential.user.uid;

  const userData = {
    id: uid,
    name: name.trim(),
    email: normalizedEmail,
    role: 'customer',
    phone: '',
    address: '',
    createdAt: new Date().toISOString(),
  };

  // Create user profile in Firestore 'users' collection
  await setDoc(doc(db, 'users', uid), userData);

  return userData;
}

/**
 * Authenticates a user or admin.
 * If the default admin account does not exist in Firebase, it automatically provisions it.
 */
async function ensureUserProfile(uid, normalizedEmail) {
  const profile = await fetchUserProfile(uid);
  if (profile) return profile;

  const defaultProfile = {
    id: uid,
    name: normalizedEmail === ADMIN_EMAIL ? 'Olive Beauty Admin' : normalizedEmail.split('@')[0],
    email: normalizedEmail,
    role: normalizedEmail === ADMIN_EMAIL ? 'admin' : 'customer',
    phone: normalizedEmail === ADMIN_EMAIL ? '+1 555 0100' : '',
    address: normalizedEmail === ADMIN_EMAIL ? '1 Olive Lane, NY' : '',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', uid), defaultProfile);
  if (defaultProfile.role === 'admin') {
    await setDoc(doc(db, 'admins', uid), {
      id: uid,
      email: ADMIN_EMAIL,
      role: 'admin',
      createdAt: defaultProfile.createdAt,
    }).catch(() => {});
  }
  return defaultProfile;
}

async function provisionAdminAccount() {
  const adminCred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  const uid = adminCred.user.uid;
  const adminProfile = {
    id: uid,
    name: 'Olive Beauty Admin',
    email: ADMIN_EMAIL,
    role: 'admin',
    phone: '+1 555 0100',
    address: '1 Olive Lane, NY',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', uid), adminProfile);
  await setDoc(doc(db, 'admins', uid), {
    id: uid,
    email: ADMIN_EMAIL,
    role: 'admin',
    createdAt: adminProfile.createdAt,
  });
  return adminProfile;
}

export async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  const isAdminLogin =
    normalizedEmail === ADMIN_EMAIL && normalizedPassword === ADMIN_PASSWORD;

  if (isAdminLogin) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        normalizedPassword
      );
      return ensureUserProfile(userCredential.user.uid, normalizedEmail);
    } catch (signInError) {
      const canBootstrap =
        signInError.code === 'auth/user-not-found' ||
        signInError.code === 'auth/invalid-credential' ||
        signInError.code === 'auth/wrong-password' ||
        signInError.code === 'auth/configuration-not-found';

      if (!canBootstrap) throw signInError;

      try {
        return await provisionAdminAccount();
      } catch (provisionError) {
        if (provisionError.code === 'auth/email-already-in-use') {
          const mismatch = new Error(
            'Admin account exists with a different password. In Firebase Console → Authentication, reset admin@olivebeauty.com to "admin123", or delete that user and sign in again.'
          );
          mismatch.code = 'auth/admin-password-mismatch';
          throw mismatch;
        }
        throw provisionError;
      }
    }
  }

  const userCredential = await signInWithEmailAndPassword(
    auth,
    normalizedEmail,
    normalizedPassword
  );
  return ensureUserProfile(userCredential.user.uid, normalizedEmail);
}

/**
 * Sign out of current Firebase session.
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Sends a password reset email via Firebase.
 */
export async function sendPasswordReset(email) {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

/**
 * Fetches user profile from Firestore.
 */
export async function fetchUserProfile(uid) {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

/**
 * Updates user profile details in Firestore.
 */
export async function updateUserProfile(uid, updates) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, updates);
  // Also check if admin and sync if needed
  const snap = await getDoc(userRef);
  if (snap.exists() && snap.data().role === 'admin') {
    await updateDoc(doc(db, 'admins', uid), {
      email: snap.data().email,
      ...updates,
    }).catch(() => {}); // Safely catch if not in admins collection
  }
}
