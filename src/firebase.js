import {initializeApp} from 'firebase/app'
import {getFirestore } from  'firebase/firestore'
import {getAuth } from  'firebase/auth'
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCptWXOHXiPEgDjxGxgYSTm2VDtddDiBWU",
  authDomain: "portofolio-c91e6.firebaseapp.com",
  projectId: "portofolio-c91e6",
  storageBucket: "portofolio-c91e6.firebasestorage.app",
  messagingSenderId: "160085420112",
  appId: "1:160085420112:web:b1613f790ff9598d384955",
  measurementId: "G-NF228K134M"
};
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
const analytics = getAnalytics(app);