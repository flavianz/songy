import { useEffect, useState } from "react";
import {
    doc,
    onSnapshot,
    deleteField,
    writeBatch,
    updateDoc,
} from "firebase/firestore";
import {
    Navigate,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import { firestore, functions } from "../../../firebase/firebase.ts";
import { getUser } from "../../../context/AuthContext.tsx";
import { httpsCallable } from "firebase/functions";
import { debug } from "../../../main.tsx";
import styles from "./Lobby.module.css";
import ChevronsUpIcon from "../../../assets/icons/ChevronsUpIcon.tsx";
import UserXIcon from "../../../assets/icons/UserXIcon.tsx";
import { FirestoreLobby } from "../../../types/types.ts";
import { LobbyPlayer } from "../../../../functions/src/types/types.ts";

export default function Lobby() {
    const user = getUser()!;
    let { lobbyCode } = useParams();
    console.log(user);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    if (!lobbyCode) {
        return <Navigate to="/join" />;
    }

    const [lobbyData, setLobbyData] = useState<FirestoreLobby | null>(null);
    const [loading, setLoading] = useState(true);
    const [_error, setError] = useState("");

    useEffect(() => {
        debug("subscribed lobby");
        const unsub = onSnapshot(
            doc(firestore, "lobbies", lobbyCode),
            (document) => {
                debug("fetched lobby");
                if (!document.exists()) {
                    unsub();
                    setError("Lobby does not exist");
                    return;
                }
                let data = document.data() as FirestoreLobby;
                if (!Object.keys(data.players).includes(user.auth.uid)) {
                    navigate("/join");
                }
                if (
                    data.game !== "" &&
                    searchParams.get("ignore") !== data.game
                ) {
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
        <div id={styles.container}>
            <div id={styles.header} className={"glassy"}>
                <p id={styles.title}>
                    {lobbyData?.players![lobbyData?.host!].username}'s lobby
                </p>
                <p id={styles.playerCount}>
                    {Object.keys(lobbyData?.players!).length}/
                    {lobbyData?.maxPlayers}
                </p>
                <div>
                    {lobbyData?.host === user.auth.uid && (
                        <button
                            className={"glassy " + styles.button}
                            onClick={handleStartGame}
                        >
                            Start Game
                        </button>
                    )}
                    <button
                        className={"glassy " + styles.button}
                        onClick={handleQuit}
                    >
                        Leave
                    </button>
                </div>
            </div>
            <div id={styles.players}>
                {Object.entries(lobbyData!.players).map(
                    (player: [string, LobbyPlayer], key) => {
                        return (
                            <div
                                key={key}
                                className={"glassy " + styles.playerContainer}
                            >
                                <div
                                    style={{
                                        background: "#" + player[1].color,
                                    }}
                                    className={styles.profileBubble}
                                />
                                <p className={styles.playerUsername}>
                                    {player[1].username === user.username
                                        ? "You"
                                        : player[1].username}
                                </p>
                                {lobbyData?.host === user.auth.uid &&
                                    player[0] !== user.auth.uid && (
                                        <div id={styles.hostContainer}>
                                            <button
                                                onClick={() =>
                                                    promotePlayer(player[0])
                                                }
                                                className={
                                                    "glassy " +
                                                    styles.hostActionButton
                                                }
                                            >
                                                <ChevronsUpIcon />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    kickPlayer(player[0])
                                                }
                                                className={
                                                    "glassy " +
                                                    styles.hostActionButton
                                                }
                                            >
                                                <UserXIcon />
                                            </button>
                                        </div>
                                    )}
                            </div>
                        );
                    },
                )}
            </div>
        </div>
    );
}
