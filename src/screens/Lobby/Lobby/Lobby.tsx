import { ensureSignOut } from "../../../firebase/auth.ts";
import { useState } from "react";
import { FirestoreLobby } from "../../../firebase/types.ts";
import { doc, onSnapshot, deleteField, writeBatch } from "firebase/firestore";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { firestore } from "../../../firebase/firebase.ts";
import { wc_hex_is_light } from "../../../firebase/functions/utils.ts";
import { getUser } from "../../../context/AuthContext.tsx";

export default function Lobby() {
    ensureSignOut();
    const user = getUser()!;
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
        const batch = writeBatch(firestore);
        console.log("1");
        batch.update(doc(firestore, "lobbies", lobbyCode!), {
            ["players." + user.auth.uid]: deleteField(),
        });
        console.log("2");
        batch.update(doc(firestore, "users", user.auth.uid), {
            lobby: "",
        });
        console.log("3");
        await batch.commit();
        console.log("4");
        navigate("/");
    }

    async function handleStartGame() {}

    return (
        <div>
            <p>Max Players: {lobbyData!.max_players}</p>
            <p>Lobby Code: {lobbyCode}</p>
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
            {lobbyData!.host === user.auth.uid && (
                <button onClick={handleStartGame}>Start game</button>
            )}
        </div>
    );
}
