// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAv16K6EWbzReV9W1wzC4KSO-jjO9kywug",
  authDomain: "grubgate-514cf.firebaseapp.com",
  projectId: "grubgate-514cf",
  storageBucket: "grubgate-514cf.firebasestorage.app",
  messagingSenderId: "393252121011",
  appId: "1:393252121011:web:4b9cd8bd63490d9d4c83c6",
  measurementId: "G-DYYX3XEZHD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
