import { collection, addDoc } from "firebase/firestore";
import { firestore } from "../firebase.ts";

export async function createFirebaseUser(uid: string, username: string) {
    return await addDoc(collection(firestore, "users"), {
        uid: uid,
        username: username,
        level: 0,
    });
}
