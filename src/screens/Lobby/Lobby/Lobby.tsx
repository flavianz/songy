import { ensureSignOut } from "../../../firebase/auth.ts";
import { useState } from "react";
import { FirestoreLobby } from "../../../firebase/types.ts";
import { doc, onSnapshot, updateDoc, deleteField } from "firebase/firestore";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { firestore } from "../../../firebase/firebase.ts";
import { getUser } from "../../../context/AuthContext.tsx";

export default function Lobby() {
    ensureSignOut();
    let user = getUser()!;
    let { lobbyCode } = useParams();

    const navigate = useNavigate();

    if (!lobbyCode) {
        return <Navigate to="/join" />;
    }

    const [lobbyData, setLobbyData] = useState<FirestoreLobby | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const unsub = onSnapshot(doc(firestore, "lobbies", lobbyCode), (doc) => {
        if (!doc.exists()) {
            unsub();
            setError("Lobby does not exist");
            return;
        }
        setLobbyData(doc.data() as FirestoreLobby);
        setLoading(false);
        if (
            !Object.keys((doc.data() as FirestoreLobby).players).includes(
                user.auth.uid,
            )
        ) {
            unsub();
        }
    });

    if (loading) {
        return (
            <div>
                <p>loading...</p>
            </div>
        );
    }

    async function handleQuit() {
        console.log("1");
        await updateDoc(doc(firestore, "lobbies", lobbyCode!), {
            ["players." + user.auth.uid]: deleteField(),
        });
        console.log("2");
        await updateDoc(doc(firestore, "users", user.auth.uid), {
            lobby: "",
        });
        console.log("3");
        unsub();
        console.log("4");
        navigate("/");
    }

    return (
        <div>
            <p>Max Players: {lobbyData!.max_players}</p>
            <p>Players:</p>
            {Object.keys(lobbyData!.players).map((uid, key) => {
                const player = lobbyData!.players[uid];
                return (
                    <div style={{ background: "#" + player.color }} key={key}>
                        <p
                            style={{
                                color: wc_hex_is_light(player.color)
                                    ? "#000000"
                                    : "#FFFFFF",
                            }}
                        >
                            {player.username} [{uid}]
                        </p>
                    </div>
                );
            })}
            <p>{error}</p>
            <button onClick={handleQuit}>Leave Lobby</button>
        </div>
    );
}

function wc_hex_is_light(color: string) {
    const c_r = parseInt(color.substring(0, 2), 16);
    const c_g = parseInt(color.substring(2, 4), 16);
    const c_b = parseInt(color.substring(4, 6), 16);
    const brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000;
    return brightness > 155;
}
