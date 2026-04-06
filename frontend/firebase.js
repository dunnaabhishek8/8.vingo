// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "vingo-food-delivery-eaf4a.firebaseapp.com",
  projectId: "vingo-food-delivery-eaf4a",
  storageBucket: "vingo-food-delivery-eaf4a.firebasestorage.app",
  messagingSenderId: "942167006827",
  appId: "1:942167006827:web:b71ece4f196e54873cdb2e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth}