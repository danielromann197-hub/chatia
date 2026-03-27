import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3Xrlzhy-2DtgnY3cA4_eVheB1MkBlbx8",
  authDomain: "calle-7-chat.firebaseapp.com",
  projectId: "calle-7-chat",
  storageBucket: "calle-7-chat.firebasestorage.app",
  messagingSenderId: "225822383587",
  appId: "1:225822383587:web:13cea9c5aad0ebd26994d6",
  measurementId: "G-04GFY5D3YK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const registerWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
