// src/firebase.js - Add these configurations
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { updateDoc, doc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAAwrZAhVfm4wIuQt-5NHLYFHjZmI_Pf0E",
    authDomain: "college-election-system.firebaseapp.com",
    projectId: "college-election-system",
    storageBucket: "college-election-system.firebasestorage.app",
    messagingSenderId: "928660193324",
    appId: "1:928660193324:web:5a687613207397ef021189",
    measurementId: "G-3GKEM4JJZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// For email link authentication
auth.settings = {
  // URL for password reset and email verification actions
  url: window.location.origin,
};

export { auth, db };