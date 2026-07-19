import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0195622465",
  appId: "1:1013947647989:web:0e87f8839f9fdc38d6c2bc",
  apiKey: "AIzaSyBRmxjDWqFgvGsTyBclmv7iAK1FnVM9_UQ",
  authDomain: "gen-lang-client-0195622465.firebaseapp.com",
  storageBucket: "gen-lang-client-0195622465.firebasestorage.app",
  messagingSenderId: "1013947647989"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
