// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACerfzB8FS93SiKBq57GX62Po6DxnfNZI",
  authDomain: "login-auth-6838c.firebaseapp.com",
  projectId: "login-auth-6838c",
  storageBucket: "login-auth-6838c.firebasestorage.app",
  messagingSenderId: "306106278583",
  appId: "1:306106278583:web:718797b3871100a7a96332",
  measurementId: "G-LBVWG61FF3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth=getAuth();
export default app;