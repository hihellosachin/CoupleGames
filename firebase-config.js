// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAuXHZih_c2A0zsmcTVGIvhwnWl_4vEAQU",
  authDomain: "key-hunt.firebaseapp.com",
  projectId: "key-hunt",
  storageBucket: "key-hunt.firebasestorage.app",
  messagingSenderId: "73038709163",
  appId: "1:73038709163:web:5cd1166ae51b2410fad2ee",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);