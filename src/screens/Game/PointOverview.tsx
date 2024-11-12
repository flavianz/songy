import { Game, Guesses } from "../../firebase/types.ts";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase.ts";

export default function PointOverview({
    game,
    uuid,
}: {
    game: Game;
    uuid: string;
}) {
    const [guesses, setGuesses] = useState<Guesses | null>(null);
    const [error, setError] = useState<null | string>(null);

    useEffect(() => {
        getDoc(
            doc(firestore, "/games/" + uuid + "/guesses/" + game.curr_round),
        ).then((doc) => {
            if (!doc.exists()) {
                setError("invalid round");
                return;
            }
            setGuesses(doc.data() as Guesses);
        });
    }, [game.curr_round]);

    if (!guesses) {
        return <div>loading results...</div>;
    }

    if (error) {
        return (
            <div>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div>
            {Object.keys(guesses).map((guessId, key) => {
                if (guessId === "solution") {
                    return;
                }
                const guess = guesses[guessId] ?? {
                    title: "No guess",
                    author: "No guess",
                    release: 0,
                    album: "No guess",
                };
                return (
                    <div key={key} style={{ display: "flex" }}>
                        <p>
                            {guess.title}{" "}
                            {guess.title === guesses.solution.title && "(+10)"}
                        </p>
                        <p>
                            {guess.album}{" "}
                            {guess.album === guesses.solution.album && "(+10)"}
                        </p>
                        <p>
                            {guess.author}{" "}
                            {guess.author === guesses.solution.author &&
                                "(+10)"}
                        </p>
                        <p>
                            {guess.release} (+
                            {Math.floor(
                                100 /
                                    (Math.abs(
                                        guess.release -
                                            guesses.solution.release,
                                    ) +
                                        10),
                            )}
                            )
                        </p>
                        <p>
                            +
                            {(guess.title === guesses.solution.title ? 10 : 0) +
                                (guess.album === guesses.solution.album
                                    ? 10
                                    : 0) +
                                (guess.author === guesses.solution.author
                                    ? 10
                                    : 0) +
                                Math.floor(
                                    100 /
                                        (Math.abs(
                                            guess.release -
                                                guesses.solution.release,
                                        ) +
                                            10),
                                )}
                        </p>
                        <p>{game.players[guessId]!.points}</p>
                    </div>
                );
            })}
            <div style={{ display: "flex" }}>
                <p>{guesses.solution.title}</p>
                <p>{guesses.solution.album}</p>
                <p>{guesses.solution.author}</p>
                <p>{guesses.solution.release}</p>
            </div>
        </div>
    );
}
