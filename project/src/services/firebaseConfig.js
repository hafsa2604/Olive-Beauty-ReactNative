import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSRYYJl98Uayw-rB79xYALE2RAJquihak",
  authDomain: "olive-beauty-306df.firebaseapp.com",
  projectId: "olive-beauty-306df",
  storageBucket: "olive-beauty-306df.firebasestorage.app",
  messagingSenderId: "381565786814",
  appId: "1:381565786814:web:27e71584b96cb30f215cef",
  measurementId: "G-JWFH7FXEP3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore Database
const db = getFirestore(app);

// Initialize Storage for product images
const storage = getStorage(app);

export { app, auth, db, storage };
