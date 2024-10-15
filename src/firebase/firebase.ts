import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAnFOviUBFjJ-RCA09cSae2Vofy-M1HJlY",
    authDomain: "songy-7bad2.firebaseapp.com",
    projectId: "songy-7bad2",
    storageBucket: "songy-7bad2.appspot.com",
    messagingSenderId: "220541194784",
    appId: "1:220541194784:web:c5e8c0f724bee00202a245",
    measurementId: "G-DXEV64NHZX",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore();

export { app, auth, firestore };
