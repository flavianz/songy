import { useEffect, useState } from "react";
import { FirestoreLobby } from "../../../firebase/types.ts";
import {
    doc,
    onSnapshot,
    deleteField,
    writeBatch,
    updateDoc,
} from "firebase/firestore";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { firestore, functions } from "../../../firebase/firebase.ts";
import { wc_hex_is_light } from "../../../firebase/functions/utils.ts";
import { getUser } from "../../../context/AuthContext.tsx";
import { httpsCallable } from "firebase/functions";
import { debug } from "../../../main.tsx";

export default function Lobby() {
    const user = getUser()!;
    let { lobbyCode } = useParams();
    console.log(user);
    const navigate = useNavigate();

    if (!lobbyCode) {
        return <Navigate to="/join" />;
    }

    const [lobbyData, setLobbyData] = useState<FirestoreLobby | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        debug("subscribed lobby");
        const unsub = onSnapshot(
            doc(firestore, "lobbies", lobbyCode),
            (doc) => {
                debug("fetched lobby");
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
            debug("unsub lobby");
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

    async function kickPlayer(uid: string) {
        let result = confirm(
            "Kick player " + lobbyData!.players[uid].username + "?",
        );
        if (!result) {
            return;
        }
        let batch = writeBatch(firestore);
        batch.update(doc(firestore, "/lobbies/" + lobbyCode), {
            ["players." + uid]: deleteField(),
        });
        batch.update(doc(firestore, "/users/" + uid), {
            lobby: "",
        });
        await batch.commit();
    }
    async function promotePlayer(uid: string) {
        let result = confirm(
            "Promote player " + lobbyData!.players[uid].username + "?",
        );
        if (!result) {
            return;
        }
        await updateDoc(doc(firestore, "/lobbies/" + lobbyCode), {
            host: uid,
        });
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
                        {lobbyData?.host === user.auth.uid &&
                            uid !== user.auth.uid && (
                                <>
                                    <button onClick={() => kickPlayer(uid)}>
                                        Kick Player
                                    </button>
                                    <button onClick={() => promotePlayer(uid)}>
                                        Promote to host
                                    </button>
                                </>
                            )}
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
