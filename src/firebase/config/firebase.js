// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC96i7Uy2NCt5JaOZpd_F9Rgnh_OFNSvuM",
  authDomain: "lingoapp-22ef3.firebaseapp.com",
  projectId: "lingoapp-22ef3",
  storageBucket: "lingoapp-22ef3.firebasestorage.app",
  messagingSenderId: "995907048374",
  appId: "1:995907048374:web:159efa5a9226c12e6ba717",
  measurementId: "G-2Z2T3J5591"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app)
export const db = getFirestore(app);