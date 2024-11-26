import { Game, Guesses } from "../../firebase/types.ts";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase.ts";
import styles from "./PointOverview.module.css";

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
        <div className={"glassy"} id={styles.solutionContainer}>
            <div id={styles.tableHeader}>
                <p className={styles.answerField} style={{ flex: 2 }}>
                    Title
                </p>
                <p className={styles.answerField} style={{ flex: 2 }}>
                    Album
                </p>
                <p className={styles.answerField} style={{ flex: 2 }}>
                    Artist
                </p>
                <p className={styles.answerField} style={{ flex: 2 }}>
                    Release Year
                </p>
                <p className={styles.answerField}>Round Points</p>
                <p className={styles.answerField}>New Total</p>
            </div>
            <div className={"glassy"} id={styles.answerContainer}>
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
                        <div
                            key={key}
                            style={{ display: "flex" }}
                            className={styles.singleAnswerContainer}
                        >
                            <p
                                className={styles.answerField}
                                style={{ flex: 2 }}
                            >
                                {guess.title}{" "}
                                {guess.title === guesses.solution.title &&
                                    "(+10)"}
                            </p>
                            <p
                                className={styles.answerField}
                                style={{ flex: 2 }}
                            >
                                {guess.album}{" "}
                                {guess.album === guesses.solution.album &&
                                    "(+10)"}
                            </p>
                            <p
                                className={styles.answerField}
                                style={{ flex: 2 }}
                            >
                                {guess.author}{" "}
                                {guess.author === guesses.solution.author &&
                                    "(+10)"}
                            </p>
                            <p
                                className={styles.answerField}
                                style={{ flex: 2 }}
                            >
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
                            <p className={styles.answerField}>
                                +
                                {(guess.title === guesses.solution.title
                                    ? 10
                                    : 0) +
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
                            <p className={styles.answerField}>
                                {game.players[guessId]!.points}
                            </p>
                        </div>
                    );
                })}
            </div>
            <div
                style={{ display: "flex" }}
                className={"glassy " + styles.singleAnswerContainer}
            >
                <p className={styles.answerField} style={{ flex: 2 }}>
                    {guesses.solution.title}
                </p>
                <p className={styles.answerField} style={{ flex: 2 }}>
                    {guesses.solution.album}
                </p>
                <p className={styles.answerField} style={{ flex: 2 }}>
                    {guesses.solution.author}
                </p>
                <p className={styles.answerField} style={{ flex: 2 }}>
                    {guesses.solution.release}
                </p>
                <p className={styles.answerField}></p>
                <p className={styles.answerField}></p>
            </div>
        </div>
    );
}
