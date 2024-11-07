import { useEffect, useState } from "react";
import { FirestoreLobby } from "../../../firebase/types.ts";
import { doc, onSnapshot, deleteField, writeBatch } from "firebase/firestore";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { firestore, functions } from "../../../firebase/firebase.ts";
import { wc_hex_is_light } from "../../../firebase/functions/utils.ts";
import { getUser } from "../../../context/AuthContext.tsx";
import { httpsCallable } from "firebase/functions";

export default function Lobby() {
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
                let data = doc.data() as FirestoreLobby;
                if (!Object.keys(data.players).includes(user.auth.uid)) {
                    navigate("/join");
                }
                if (data.game !== "") {
                    navigate("/game/" + data.game);
                }
                setLobbyData(data);
                setLoading(false);
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
        let response = (await startGame({
            code: lobbyCode,
        })) as { data: { code: string; data?: { uuid: string } } };
        console.log(response);
        if (response.data.code === "100") {
            navigate("/game/" + response.data.data?.uuid);
        }
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
