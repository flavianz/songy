import { FormEvent, useState } from "react";
import {
    collection,
    getDocs,
    query,
    where,
    addDoc,
    doc,
} from "firebase/firestore";
import { firestore } from "../../../firebase/firebase.ts";
import { getUser } from "../../../context/AuthContext.tsx";
import { ensureSignOut } from "../../../firebase/auth.ts";

export default function Join() {
    ensureSignOut(true);
    let user = getUser()!;

    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        let lobby = await getDocs(
            query(collection(firestore, "lobbies"), where("code", "==", code)),
        );
        if (lobby.docs.length === 0) {
            setError("Unknown lobby code");
            return;
        }
        await addDoc(
            collection(doc(firestore, "lobbies", lobby.docs[0].id), "players"),
            {
                uid: user.uid,
                username: user,
            },
        );
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value);
                    }}
                />
                <button type="submit">Join Game</button>
                <p>{error}</p>
            </form>
        </div>
    );
}
