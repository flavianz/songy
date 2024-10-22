import { ensureSignOut } from "../../../firebase/auth.ts";
import { useEffect, useState } from "react";
import { FirestoreLobby } from "../../../firebase/types.ts";
import { doc, onSnapshot, deleteField, writeBatch } from "firebase/firestore";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { firestore } from "../../../firebase/firebase.ts";
import {
    functions,
    wc_hex_is_light,
} from "../../../firebase/functions/utils.ts";
import { getUser } from "../../../context/AuthContext.tsx";
import { httpsCallable } from "firebase/functions";

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

    useEffect(() => {
        console.log("subscribed lobby");
        const unsub = onSnapshot(
            doc(firestore, "lobbies", lobbyCode),
            (doc) => {
                console.log("fetched lobby");
                if (!doc.exists()) {
                    unsub();
                    setError("Lobby does not exist");
                    return;
                }
                setLobbyData(doc.data() as FirestoreLobby);
                setLoading(false);
                if (
                    !Object.keys(
                        (doc.data() as FirestoreLobby).players,
                    ).includes(user.auth.uid)
                ) {
                    unsub();
                }
            },
        );

        return () => {
            console.log("unsub lobby");
            unsub();
        };
    }, []);

    if (loading) {
        return (
            <div>
                <p>loading...</p>
            </div>
        );
    }

    async function handleQuit() {
        const batch = writeBatch(firestore);
        if (Object.keys(lobbyData!.players).length === 1) {
            batch.delete(doc(firestore, "lobbies", lobbyCode!));
        } else {
            batch.update(doc(firestore, "lobbies", lobbyCode!), {
                ["players." + user.auth.uid]: deleteField(),
            });
        }
        batch.update(doc(firestore, "users", user.auth.uid), {
            lobby: "",
        });

        await batch.commit();
        navigate("/");
    }

    async function handleStartGame() {
        const startGame = httpsCallable(functions, "startGame");
        let response = await startGame({ code: lobbyCode });
        console.log(response);
    }

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
