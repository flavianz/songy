import { FormEvent, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase.ts";
import { getUser } from "../../../context/AuthContext.tsx";
import { ensureSignOut } from "../../../firebase/auth.ts";

export default function Join() {
    ensureSignOut();
    let user = getUser()!;

    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        let lobby = await getDoc(doc(firestore, "users", code));
        if (lobby.exists()) {
            setError("Unknown lobby code");
            return;
        }
        await setDoc(
            doc(firestore, "lobbies", code, "players", user.auth.uid),
            {
                username: user.username,
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
