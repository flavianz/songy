import { Game, Guess } from "../../firebase/types.ts";
import { useState } from "react";
import PlayerList from "./PlayerList.tsx";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase.ts";
import { getUser } from "../../context/AuthContext.tsx";
import styles from "./LyricsOverview.module.css";

export default function LyricsOverview({
    game,
    lyrics,
    setError,
    uuid,
}: {
    game: Game;
    lyrics: string;
    setError: (msg: string) => void;
    uuid: string;
}) {
    let user = getUser()!;
    const [input, setInput] = useState<Guess>({
        album: "",
        author: "",
        release: 0,
        title: "",
    });

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

    return (
        <div>
            <PlayerList game={game} />
            <div id={styles.lyricsContainer}>
                <p id={styles.lyrics}>{lyrics}</p>
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
