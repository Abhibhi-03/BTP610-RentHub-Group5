// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOyRiXcvTEHSnQCiE7DWThbUSWnCU3uo8",
  authDomain: "rental-app-btp610.firebaseapp.com",
  databaseURL: "https://rental-app-btp610-default-rtdb.firebaseio.com",
  projectId: "rental-app-btp610",
  storageBucket: "rental-app-btp610.firebasestorage.app",
  messagingSenderId: "761622505160",
  appId: "1:761622505160:web:e7156dd4462a734242e7fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(app);
const firebaseDB = getFirestore(app);
const firebaseStorage = getStorage(app);


export { firebaseAuth, firebaseDB, firebaseStorage };