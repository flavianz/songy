import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { Game, GameState } from "../../firebase/types.ts";
import { firestore, functions } from "../../firebase/firebase.ts";
import { getUser } from "../../context/AuthContext.tsx";
import PlayerList from "./PlayerList.tsx";
import LyricsOverview from "./LyricsOverview.tsx";
import Countdown from "./Countdown.tsx";
import PointOverview from "./PointOverview.tsx";
import { httpsCallable } from "firebase/functions";
import EndOverview from "./EndOverview.tsx";

export default function GameScreen() {
    let user = getUser()!;
    const { uuid } = useParams();

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
        const nextRound = httpsCallable(functions, "nextRound");
        await nextRound({
            uuid: uuid,
        });
        setGameState("guessing");
        console.log("completed submit");
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
            <div>
                round starts in:{" "}
                {
                    <Countdown
                        start={Math.ceil(
                            (game.round_start - Date.now()) / 1000,
                        )}
                        onComplete={() => setGameState("guessing")}
                    />
                }
            </div>
        );
    }

    if (gameState === "overview") {
        return (
            <div>
                <PointOverview game={game} uuid={uuid} />
                {game.curr_round + 1 < game.total_rounds ? (
                    game.host === user.auth.uid ? (
                        <button onClick={nextRound}>Continue</button>
                    ) : (
                        <p>waiting for host to continue</p>
                    )
                ) : (
                    <button onClick={() => setGameState("finished")}>
                        Finish Game
                    </button>
                )}
            </div>
        );
    }

    if (gameState === "finished") {
        return (
            <div>
                <EndOverview game={game} />
            </div>
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

    return (
        <LyricsOverview
            game={game}
            lyrics={lyrics!}
            uuid={uuid}
            setError={setError}
        />
    );
}
