// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getFirebaseConfig } from "./config/env";

// Get Firebase configuration
const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
let app;
let db;

// Only initialize Firebase in the browser
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    // Enable offline persistence
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Offline persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support offline persistence.');
      }
    });
    
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    if (firebaseConfig.apiKey.includes('dummy')) {
      console.error('Please check your .env file and ensure all Firebase configuration values are set.');
      console.log('Refer to .env.example for the required variables');
    }
  }
} else {
  console.warn('Firebase is not initialized on the server side');
}

export { db, app, firebaseConfig };
