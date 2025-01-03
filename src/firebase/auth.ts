import { auth } from "./firebase.ts";

import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendEmailVerification,
} from "firebase/auth";
import { BASE_URL } from "../main.tsx";

export async function firebaseCreateUserWithEmailAndPassword(
    email: string,
    password: string,
) {
    let result = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(result.user, {
        url: BASE_URL + "email_verified",
    });
    return result;
}

export async function firebaseSignInWithEmailAndPassword(
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

// export function ensureSignOut(allowEmailUnverified: boolean = false) {
//     const user = getUser();
//     let navigate = useNavigate();
//
//     if (!user) {
//         navigate("/signin");
//         return;
//     }
//
//     if (!user.auth.emailVerified && !allowEmailUnverified) {
//         navigate("/check_inbox");
//         return;
//     }
// }
