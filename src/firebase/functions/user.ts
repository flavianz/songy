import { collection, setDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase.ts";

export async function createFirebaseUser(uid: string, username: string) {
    return await setDoc(doc(collection(firestore, "users"), uid), {
        uid: uid,
        username: username,
        level: 0,
        lobby: "",
    });
}
