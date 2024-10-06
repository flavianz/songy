import { auth } from "./firebase.ts";

import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";

export async function firebaseCreateUserWithEmailAndPassword(
    email: string,
    password: string,
) {
    return await createUserWithEmailAndPassword(auth, email, password);
}

export async function firebaseLoginWithEmailAndPassword(
    email: string,
    password: string,
) {
    return await signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    let response = await signInWithPopup(auth, provider);
    console.log(response);
    return response;
}

export function signOut() {
    return auth.signOut();
}
