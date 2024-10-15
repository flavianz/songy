import { collection, setDoc, getDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase.ts";
import { FirestoreUser } from "../types.ts";

export async function createFirebaseUser(uid: string, username: string) {
    return await setDoc(doc(collection(firestore, "users"), uid), {
        uid: uid,
        username: username,
        level: 0,
    });
}

export async function fetchUser(uid: string): Promise<FirestoreUser> {
    return (await getDoc(doc(firestore, "users", uid))).data() as FirestoreUser;
}
