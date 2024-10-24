import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { Game, Round } from "../../firebase/types.ts";
import { firestore } from "../../firebase/firebase.ts";
import { ensureSignOut } from "../../firebase/auth.ts";
import { getUser } from "../../context/AuthContext.tsx";

export default function GameScreen() {
    ensureSignOut();
    let user = getUser()!;
    const { uuid } = useParams();
    const navigate = useNavigate();

    if (typeof uuid !== "string") {
        return <div>no uuid</div>;
    }

    const [round, setRound] = useState<Round | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(0);

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

    if (loading) {
        return <div>loading...</div>;
    }

    if (!game || !round) {
        return <div>failed to load game</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (countdown !== 0) {
        return <div>countdown: {countdown}</div>;
    }

    const [input, setInput] = useState<Input>({
        album: "",
        author: "",
        release: 0,
        title: "",
    });

    return (
        <div>
            <p>Round No. {game.curr_round}</p>
            <div>
                <p>Players:</p>
                {Object.keys(game.players).map((uid) => {
                    const player = game.players[uid];
                    return (
                        <div style={{ background: "#" + player.color }}>
                            {player.username} [{player.points}]
                        </div>
                    );
                })}
            </div>
            <div>
                <p>{round.lyrics}</p>
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
