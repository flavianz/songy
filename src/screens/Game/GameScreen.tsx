import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { Game, GameState } from "../../firebase/types.ts";
import { firestore, functions } from "../../firebase/firebase.ts";
import { getUser } from "../../context/AuthContext.tsx";
import PlayerList from "./PlayerList.tsx";
import LyricsOverview from "./LyricsOverview.tsx";
import Countdown from "./Countdown.tsx";
import PointOverview from "./PointOverview.tsx";
import { httpsCallable } from "firebase/functions";
import EndOverview from "./EndOverview.tsx";
import styles from "./GameScreen.module.css";

export default function GameScreen() {
    let user = getUser()!;
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState<Game | null>(null);
    const [lyrics, setLyrics] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState("");
    const [gameState, setGameState] = useState<GameState>("countdown");

    useEffect(() => {
        console.log("subscribed game");
        const unsubGame = onSnapshot(
            doc(firestore, "/games/" + uuid),
            (doc) => {
                console.log("refetched game");
                if (!doc.exists()) {
                    unsubGame();
                    setError("Lobby does not exist");
                    return;
                }
                let data = doc.data() as Game;
                if (!Object.keys(data.players).includes(user.auth.uid)) {
                    unsubGame();
                    setError("Not in game");
                }
                if (
                    data.players[user.auth.uid].last_guess_round ===
                    data.curr_round
                ) {
                    let allPlayersSubmitted = Object.values(data.players)
                        .map(
                            (player) =>
                                player.last_guess_round === data.curr_round,
                        )
                        .reduce((previousValue, currentValue) => {
                            {
                                return previousValue && currentValue;
                            }
                        }, true);
                    if (allPlayersSubmitted) {
                        if (data.curr_round + 1 == data.total_rounds) {
                            setGameState("finished");
                        } else {
                            setGameState("overview");
                        }
                    } else {
                        setGameState("submitted");
                    }
                }
                if (data.max_round_end < Date.now()) {
                    setGameState("overview");
                }
                console.log("game:", data);
                setGame(data);
                setLoading(false);
            },
            (e) => {
                console.log("Game error");
                console.error(e);
            },
        );

        return () => {
            setGame(null);
            unsubGame();
        };
    }, []);

    async function fetchLyrics() {
        if (!game) {
            return;
        }
        let lyrics = await getDoc(
            doc(firestore, "/games/" + uuid + "/lyrics/" + game.curr_round),
        );
        if (!lyrics.exists()) {
            setError("Internal Error: Access to lyrics denied");
        }
        setLyrics(lyrics.data()?.lyrics);
    }

    async function nextRound() {
        let now = Date.now();
        const nextRound = httpsCallable(functions, "nextRound");
        console.log(Date.now() - now);
        await nextRound({
            uuid: uuid,
        });
        setGameState("countdown");
        console.log("completed submit");
    }

    async function endGame() {
        await updateDoc(doc(firestore, "lobbies", user.lobby), {
            game: "",
        });
        returnToLobby();
    }

    function returnToLobby() {
        navigate("/lobby/" + user.lobby + "?ignore=" + uuid);
    }

    useEffect(() => {
        if (!game) {
            return;
        }
        setTimeout(fetchLyrics, Math.max(game.round_start - Date.now(), 0));
    }, [game?.curr_round]);

    if (typeof uuid !== "string") {
        return <div>no uuid</div>;
    }

    if (loading) {
        return <div>loading...</div>;
    }

    if (!game) {
        return <div>failed to load game</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (gameState === "countdown") {
        return (
            <Frame title={"Get Ready"} topComponent={null}>
                <div id={styles.countdownContainer}>
                    <h2>Round starts in</h2>
                    {
                        <Countdown
                            start={Math.ceil(
                                (game.round_start - Date.now()) / 1000,
                            )}
                            onComplete={() => setGameState("guessing")}
                        />
                    }
                </div>
            </Frame>
        );
    }

    if (gameState === "overview") {
        return (
            <Frame
                title={"Result"}
                topComponent={
                    game.curr_round + 1 < game.total_rounds ? (
                        game.host === user.auth.uid ? (
                            <button
                                onClick={nextRound}
                                className={"glassy button-small"}
                            >
                                Continue
                            </button>
                        ) : (
                            <p>Waiting for host to continue... </p>
                        )
                    ) : (
                        <button
                            onClick={async () => {
                                setGameState("finished");
                            }}
                            className={"glassy button-small"}
                        >
                            See ranking
                        </button>
                    )
                }
            >
                <PointOverview game={game} uuid={uuid} lyricsPreload={lyrics} />
            </Frame>
        );
    }

    if (gameState === "finished") {
        return (
            <Frame
                title={"Placements"}
                topComponent={
                    <button
                        onClick={
                            game.host === user.auth.uid
                                ? endGame
                                : returnToLobby
                        }
                        className={"glassy button-small"}
                    >
                        {game.host === user.auth.uid
                            ? "End Game"
                            : "Return to lobby"}
                    </button>
                }
            >
                <EndOverview game={game} />
            </Frame>
        );
    }

    if (gameState === "submitted") {
        return (
            <div>
                <p>Waiting for other players....</p>
                <p>
                    round ends in:{" "}
                    <Countdown
                        start={Math.ceil(
                            (game.max_round_end - Date.now()) / 1000,
                        )}
                        onComplete={() => setGameState("overview")}
                    />
                </p>
                <PlayerList game={game} />
            </div>
        );
    }

    function Frame({
        children,
        title,
        topComponent,
    }: {
        children: any;
        title: string;
        topComponent: any;
    }) {
        return (
            <div id={styles.container}>
                <div className={"glassy"} id={styles.titleContainer}>
                    <h1>
                        Round {(game?.curr_round ?? 0) + 1}/{game?.total_rounds}
                        : {title}
                    </h1>
                    {topComponent}
                </div>
                <div id={styles.contentContainer}>{children}</div>
            </div>
        );
    }

    return (
        <Frame
            title={"Take a guess"}
            topComponent={
                <div style={{ display: "flex" }}>
                    <p style={{ marginRight: "1vw" }}>Time left:</p>
                    <Countdown
                        start={Math.ceil(
                            (game.max_round_end - Date.now()) / 1000,
                        )}
                        onComplete={() => setGameState("overview")}
                    />
                </div>
            }
        >
            <LyricsOverview
                game={game}
                lyrics={lyrics!}
                uuid={uuid}
                setState={setGameState}
                setError={setError}
            />
        </Frame>
    );
}
