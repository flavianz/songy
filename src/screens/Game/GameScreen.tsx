import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { firestore } from "../../firebase/firebase.ts";
import { getUser } from "../../context/AuthContext.tsx";
import PlayerList from "./PlayerList.tsx";
import LyricsOverview from "./LyricsOverview.tsx";
import Countdown from "./Countdown.tsx";
import PointOverview from "./PointOverview.tsx";
import EndOverview from "./EndOverview.tsx";
import styles from "./GameScreen.module.css";
import { GameState, GameType } from "../../types/types.ts";
import { debug } from "../../main.tsx";
import { Game } from "../../types/Game.ts";

export default function GameScreen() {
    let user = getUser()!;
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState<Game | undefined>();
    const [lyrics, setLyrics] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState("");
    const [gameState, setGameState] = useState<GameState>(GameState.COUNTDOWN);

    useEffect(() => {
        debug("Subscribed to Game");
        const unsubGame = onSnapshot(
            doc(firestore, "/games/" + uuid),
            (doc) => {
                debug("Refetched Game");
                if (!doc.exists()) {
                    unsubGame();
                    setError("Lobby does not exist");
                    return;
                }
                let game = new Game(doc.data() as GameType, user, uuid!);

                if (!game.isInGame()) {
                    unsubGame();
                    setError("Game does not exist");
                }
                setGameState(game.getState());
                setGame(game);
                setLoading(false);
            },
            (e) => {
                debug("Game error");
                console.error(e);
            },
        );

        return () => {
            setGame(undefined);
            debug("Unsubscribed Game");
            unsubGame();
        };
    }, []);

    function returnToLobby() {
        navigate("/lobby/" + user.lobby + "?ignore=" + uuid);
    }

    useEffect(() => {
        if (!game) {
            return;
        }
        console.log("timeout started");
        setTimeout(
            async () => {
                debug("Fetching Lyrics");
                setLyrics(await game.fetchLyrics());
                debug("Fetched Lyrics");
            },
            Math.max(game.roundStart - Date.now(), 0),
        );
    }, [game?.currRound]);

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

    if (gameState === GameState.COUNTDOWN) {
        return (
            <Frame title={"Get Ready"} topComponent={null}>
                <div id={styles.countdownContainer}>
                    <h2>Round starts in</h2>
                    {
                        <Countdown
                            start={Math.ceil(
                                (game.roundStart - Date.now()) / 1000,
                            )}
                            onComplete={() => setGameState(GameState.GUESSING)}
                        />
                    }
                </div>
            </Frame>
        );
    }

    if (gameState === GameState.OVERVIEW) {
        return (
            <Frame
                title={"Result"}
                topComponent={
                    game.currRound + 1 < game.totalRounds ? (
                        game.host === user.auth.uid ? (
                            <button
                                onClick={() => game.nextRound()}
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
                                setGameState(GameState.FINISHED);
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

    if (gameState === GameState.FINISHED) {
        return (
            <Frame
                title={"Placements"}
                topComponent={
                    <button
                        onClick={
                            game.host === user.auth.uid
                                ? () => {
                                      game.endGame().then(returnToLobby);
                                  }
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

    if (gameState === GameState.SUBMITTED) {
        return (
            <div>
                <p>Waiting for other players....</p>
                <p>
                    round ends in:{" "}
                    <Countdown
                        start={Math.ceil(
                            (game.maxRoundEnd - Date.now()) / 1000,
                        )}
                        onComplete={() => setGameState(GameState.OVERVIEW)}
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
                        Round {(game?.currRound ?? 0) + 1}/{game?.totalRounds}:{" "}
                        {title}
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
                            (game.maxRoundEnd - Date.now()) / 1000,
                        )}
                        onComplete={() => setGameState(GameState.OVERVIEW)}
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
