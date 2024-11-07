import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { Game } from "../../firebase/types.ts";
import { firestore } from "../../firebase/firebase.ts";
import { getUser } from "../../context/AuthContext.tsx";

export default function GameScreen() {
    let user = getUser()!;
    const { uuid } = useParams();

    const [game, setGame] = useState<Game | null>(null);
    const [lyrics, setLyrics] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(3);
    const [input, setInput] = useState<Input>({
        album: "",
        author: "",
        release: 0,
        title: "",
    });
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
                    data.players[user.auth.uid].last_guess_round ==
                    data.curr_round
                ) {
                    setHasSubmitted(true);
                }
                if (data.round_start < Date.now()) {
                    setCountdown(0);
                }
                setCountdown(Math.ceil(data.round_start - Date.now()));
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

    function updateCount() {
        if (!game || loading) {
            return;
        }
        if (game.round_start < Date.now()) {
            setCountdown(0);
        }
        setCountdown(Math.ceil(game.round_start - Date.now()));
    }

    useEffect(() => {
        if (!game) {
            return;
        }
        setTimeout(fetchLyrics, Math.max(game.round_start - Date.now(), 0));
        const interval = setInterval(updateCount, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [game?.curr_round]);

    async function handleSubmit() {
        if (!game) {
            setError("failed to submit guesses; invalid game");
            return;
        }
        await updateDoc(
            doc(firestore, "/games/" + uuid + "/guesses/" + game.curr_round),
            {
                [user.auth.uid]: input,
            },
        );
    }

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

    if (countdown > 0) {
        return <div>countdown: {countdown}</div>;
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
        <div>
            <p>Round No. {game.curr_round + 1}</p>
            <PlayerList game={game} />
            <div>
                <pre>
                    <p>{lyrics}</p>
                </pre>
            </div>
            <div>
                <label>
                    Title:{" "}
                    <input
                        type="text"
                        value={input.title}
                        onChange={(e) =>
                            setInput({ ...input, title: e.target.value })
                        }
                    />
                </label>
                <label>
                    Author:{" "}
                    <input
                        type="text"
                        value={input.author}
                        onChange={(e) =>
                            setInput({ ...input, author: e.target.value })
                        }
                    />
                </label>
                <label>
                    Album:{" "}
                    <input
                        type="text"
                        value={input.album}
                        onChange={(e) =>
                            setInput({ ...input, album: e.target.value })
                        }
                    />
                </label>
                <label>
                    Release Year:{" "}
                    <input
                        type="number"
                        value={input.release === 0 ? "" : input.release}
                        onChange={(e) =>
                            setInput({
                                ...input,
                                release: parseInt(e.currentTarget.value),
                            })
                        }
                    />
                </label>
                <button onClick={handleSubmit}>Submit Answers</button>
            </div>
        </div>
    );
}

interface Input {
    title: string;
    author: string;
    album: string;
    release: number;
}

function PlayerList({ game }: { game: Game }) {
    return (
        <div>
            <p>Players:</p>
            {Object.keys(game.players).map((uid, key) => {
                const player = game.players[uid];
                return (
                    <div style={{ background: "#" + player.color }} key={key}>
                        <p>
                            {player.username} [{player.points}]
                        </p>
                        <p>{player.points}</p>
                        <p>
                            {player.last_guess_round === game.curr_round
                                ? "has guesses"
                                : ""}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
