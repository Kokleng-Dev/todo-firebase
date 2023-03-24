import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGBLQpv5fxZke-jcnw4ZW05Zd2kq5_OkA",
  authDomain: "todo-d256e.firebaseapp.com",
  projectId: "todo-d256e",
  storageBucket: "todo-d256e.appspot.com",
  messagingSenderId: "469322880625",
  appId: "1:469322880625:web:4b3f4652e20d97b2dfadd0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
    db
}