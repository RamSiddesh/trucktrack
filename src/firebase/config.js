// Firebase configuration for TruckTrack application

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = { 
   apiKey: import.meta.env.VITE_FIREBASE_API_KEY, 
   authDomain: "class35-51636.firebaseapp.com", 
   databaseURL: "https://class35-51636-default-rtdb.firebaseio.com", 
   projectId: "class35-51636", 
   storageBucket: "class35-51636.appspot.com", 
   messagingSenderId: "164807378897", 
   appId: "1:164807378897:web:0091d7a24d3389918c82f0" 
 };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };