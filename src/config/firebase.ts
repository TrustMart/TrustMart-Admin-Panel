import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
// Using the same Firebase project as TrustMart mobile app
const firebaseConfig = {
  apiKey: "AIzaSyDfvRUZXSYLWxPcSl4yBuOGnK8Jz3bp62g",
  authDomain: "pakricemarket-91592.firebaseapp.com",
  projectId: "pakricemarket-91592",
  storageBucket: "pakricemarket-91592.firebasestorage.app",
  messagingSenderId: "191357298388",
  appId: "1:191357298388:web:541a387236a39b85513d41",
  measurementId: "G-0RB0XX12CW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
