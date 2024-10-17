import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase.ts";
import { getUser } from "../../../context/AuthContext.tsx";
import { ensureSignOut } from "../../../firebase/auth.ts";
import { useNavigate } from "react-router-dom";
import { FirestoreLobby } from "../../../firebase/types.ts";

export default function Join() {
    ensureSignOut();

    let user = getUser()!;

    const navigate = useNavigate();

    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit() {
        let lobby = await getDoc(doc(firestore, "lobbies", code));
        if (!lobby.exists()) {
            setError("Unknown lobby code");
            return;
        }
        if (
            Object.keys((lobby.data() as FirestoreLobby).players).includes(
                user.auth.uid,
            )
        ) {
            navigate("/lobby/" + code);
            return;
        }
        await updateDoc(doc(firestore, "lobbies", code), {
            ["players." + user.auth.uid]: {
                color: getRandomHex(),
                username: user.username,
            },
        });
        await updateDoc(doc(firestore, "users", user.auth.uid), {
            lobby: code,
        });
        navigate("/lobby/" + code);
    }

    useEffect(() => {
        if (user.lobby !== "") {
            setCode(user.lobby);
            handleSubmit();
        }
    });

    return (
        <div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
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

function getRandomHex() {
    return Math.floor(Math.random() * 16777215).toString(16);
}
