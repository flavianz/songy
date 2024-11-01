import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { Game, Round } from "../../firebase/types.ts";
import { firestore } from "../../firebase/firebase.ts";
import { getUser } from "../../context/AuthContext.tsx";

export default function GameScreen() {
    let user = getUser()!;
    const { uuid } = useParams();

    const [round, setRound] = useState<Round | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(3);
    const [input, setInput] = useState<Input>({
        album: "",
        author: "",
        release: 0,
        title: "",
    });

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
                setGame(data);
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

    useEffect(() => {
        if (!game) {
            return;
        }
        console.log("subscribed round");
        let interval: NodeJS.Timeout;
        console.log("/games/" + uuid + "/rounds/" + game.curr_round);
        const unsubRound = onSnapshot(
            doc(firestore, "/games/" + uuid + "/rounds/" + game.curr_round),
            (doc) => {
                console.log("refetched round");
                if (!doc.exists()) {
                    unsubRound();
                    setError("Round does not exist");
                    return;
                }
                let round = doc.data() as Round;
                setRound(round);

                function updateCountdown() {
                    setCountdown(
                        Math.ceil((round.round_start - Date.now()) / 1000),
                    );
                }

                interval = setInterval(updateCountdown, 1000);
                setLoading(false);
            },
        );
        return () => {
            setGame(null);
            unsubRound();
            clearInterval(interval);
        };
    }, [game?.curr_round]);

    async function handleSubmit() {}

    if (typeof uuid !== "string") {
        return <div>no uuid</div>;
    }

    if (loading) {
        return <div>loading...</div>;
    }

    if (!game || !round) {
        return <div>failed to load game</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (countdown > 0) {
        return <div>countdown: {countdown}</div>;
    }

    return (
        <div>
            <p>Round No. {game.curr_round + 1}</p>
            <div>
                <p>Players:</p>
                {Object.keys(game.players).map((uid, key) => {
                    const player = game.players[uid];
                    return (
                        <div
                            style={{ background: "#" + player.color }}
                            key={key}
                        >
                            {player.username} [{player.points}]
                        </div>
                    );
                })}
            </div>
            <div>
                <pre>
                    <p>{round.lyrics}</p>
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
