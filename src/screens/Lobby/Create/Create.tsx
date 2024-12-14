import { Navigate, useNavigate } from "react-router-dom";
import { doc, writeBatch } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase.ts";
import {
    getRandomCode,
    getRandomHex,
} from "../../../firebase/functions/utils.ts";
import { getUser } from "../../../context/AuthContext.tsx";
import { FormEvent, useState } from "react";

export default function Create() {
    const [max, setMax] = useState(0);
    const navigate = useNavigate();

    let user = getUser()!;

    if (user.lobby !== "") {
        return <Navigate to={"/join"} />;
    }

    async function createLobby(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        let code = getRandomCode(4).toUpperCase();
        const batch = writeBatch(firestore);
        batch.set(doc(firestore, "lobbies", code), {
            host: user.auth.uid,
            maxPlayers: 10,
            state: "idle",
            players: {
                [user.auth.uid]: {
                    color: getRandomHex(),
                    username: user.username,
                },
            },
        });
        batch.update(doc(firestore, "users", user.auth.uid), {
            lobby: code,
        });
        await batch.commit();
        navigate("/lobby/" + code);
    }

    return (
        <div>
            <form onSubmit={(e) => createLobby(e)}>
                <label>
                    Max. Players
                    <input
                        type="numbers"
                        max={10}
                        value={max}
                        onChange={(e) => setMax(parseInt(e.target.value))}
                    />
                    <button type={"submit"}>Create Lobby</button>
                </label>
            </form>
        </div>
    );
}
