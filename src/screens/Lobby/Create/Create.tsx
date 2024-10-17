import { ensureSignOut } from "../../../firebase/auth.ts";
import { Navigate, useNavigate } from "react-router-dom";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase.ts";
import {
    getRandomCode,
    getRandomHex,
} from "../../../firebase/functions/utils.ts";
import { getUser } from "../../../context/AuthContext.tsx";

export default function Create() {
    ensureSignOut();

    const navigate = useNavigate();

    let user = getUser()!;

    if (user.lobby !== "") {
        return <Navigate to={"/join"} />;
    }

    async function createLobby() {
        let code = getRandomCode();
        await setDoc(doc(firestore, "lobbies", code), {
            host: user.auth.uid,
            max_players: 10,
            state: "idle",
            players: {
                [user.auth.uid]: {
                    color: getRandomHex(),
                    username: user.username,
                },
            },
        });
        await updateDoc(doc(firestore, "users", user.auth.uid), {
            lobby: code,
        });
        navigate("/lobby/" + code);
    }

    createLobby();

    return (
        <div>
            <p>creating lobby...</p>
        </div>
    );
}
