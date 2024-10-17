import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase.ts";
import { ensureSignOut } from "../../../firebase/auth.ts";
import { useNavigate } from "react-router-dom";
import { FirestoreLobby } from "../../../firebase/types.ts";
import { getRandomHex } from "../../../firebase/functions/utils.ts";
import { getUser } from "../../../context/AuthContext.tsx";

export default function Join() {
    ensureSignOut();

    const user = getUser()!;

    const navigate = useNavigate();

    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(lobbyCode: string) {
        let lobby = await getDoc(doc(firestore, "lobbies", lobbyCode));
        if (!lobby.exists()) {
            setError("Unknown lobby code");
            return;
        }
        if (
            Object.keys((lobby.data() as FirestoreLobby).players).includes(
                user.auth.uid,
            )
        ) {
            navigate("/lobby/" + lobbyCode);
            return;
        }
        await updateDoc(doc(firestore, "lobbies", lobbyCode), {
            ["players." + user.auth.uid]: {
                color: getRandomHex(),
                username: user.username,
            },
        });
        await updateDoc(doc(firestore, "users", user.auth.uid), {
            lobby: lobbyCode,
        });
        navigate("/lobby/" + lobbyCode);
    }

    useEffect(() => {
        if (user.lobby !== "") {
            handleSubmit(user.lobby);
        }
    });

    return (
        <div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(code);
                }}
            >
                <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                    }}
                />
                <button type="submit">Join Game</button>
                <p>{error}</p>
            </form>
        </div>
    );
}
