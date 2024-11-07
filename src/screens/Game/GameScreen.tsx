import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { Game } from "../../firebase/types.ts";
import { firestore } from "../../firebase/firebase.ts";
import { getUser } from "../../context/AuthContext.tsx";
import PlayerList from "./PlayerList.tsx";
import LyricsOverview from "./LyricsOverview.tsx";
import Countdown from "./Countdown.tsx";

export default function GameScreen() {
    let user = getUser()!;
    const { uuid } = useParams();

    const [game, setGame] = useState<Game | null>(null);
    const [lyrics, setLyrics] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState("");
    const [roundCountdown, setRoundCountdown] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

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
                    setHasSubmitted(true);
                }
                setGame(data);
                setRoundCountdown(data.round_start > Date.now());
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

    if (roundCountdown) {
        return (
            <div>
                round starts in:{" "}
                {
                    <Countdown
                        start={Math.ceil(
                            (game.round_start - Date.now()) / 1000,
                        )}
                        onComplete={() => setRoundCountdown(false)}
                    />
                }
            </div>
        );
    }

    if (hasSubmitted) {
        return (
            <div>
                <p>Waiting for other players....</p>
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
