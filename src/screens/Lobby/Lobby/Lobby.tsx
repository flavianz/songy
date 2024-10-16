import { ensureSignOut } from "../../../firebase/auth.ts";
import { useState } from "react";
import { FirestoreLobby } from "../../../firebase/types.ts";
import { doc, onSnapshot } from "firebase/firestore";
import { Navigate, useParams } from "react-router-dom";
import { firestore } from "../../../firebase/firebase.ts";
import { getUser } from "../../../context/AuthContext.tsx";

export default function Lobby() {
    ensureSignOut();
    let user = getUser()!;
    let { lobbyCode } = useParams();

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
            !lobbyData!.players.map((user) => user.uid).includes(user.auth.uid)
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

    return (
        <div>
            <p>Max Players: {lobbyData!.max_players}</p>
            <p>Players:</p>
            {lobbyData!.players.map((player) => {
                return (
                    <div style={{ background: "#" + player.color }}>
                        {player.username} [{player.uid}]
                    </div>
                );
            })}
            <p>{error}</p>
        </div>
    );
}
