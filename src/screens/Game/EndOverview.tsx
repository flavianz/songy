import { getUser } from "../../context/AuthContext.tsx";
import styles from "./EndOverview.module.css";
import { wcHexIsLight } from "../../firebase/functions/utils.ts";
import { Game } from "../../types/Game.ts";
import { useEffect, useState } from "react";
import { GamePlayer } from "../../types/types.ts";

export default function EndOverview({ game }: { game: Game }) {
    const [loading, setLoading] = useState(false);

    let user = getUser()!;

    useEffect(() => {
        game.calculateGameResults().then(() => {
            setLoading(false);
        });
    });

    let results = game.getRankedPlayers();

    function PodiumCard({
        player,
        rank,
    }: {
        player: GamePlayer;
        rank: number;
    }) {
        return (
            <div
                className={"glassy " + styles.podiumCard}
                id={
                    rank == 0
                        ? styles.first
                        : rank == 1
                          ? styles.second
                          : styles.third
                }
            >
                <div
                    style={{
                        background: "#" + player.color,
                    }}
                    className={styles.podiumBubble}
                >
                    <p
                        style={{
                            color: wcHexIsLight(player.color)
                                ? "unset"
                                : "var(--background)",
                        }}
                    >
                        {rank == 0 ? "1st" : rank == 1 ? "2nd" : "3rd"}
                    </p>
                </div>
                <p className={styles.podiumUsername}>
                    {player.username === user.username
                        ? "You"
                        : player.username}
                </p>
                <p>Points: {player.points}</p>
            </div>
        );
    }

    if (loading)
        return (
            <div>
                <p>loading...</p>
            </div>
        );

    return (
        <div id={styles.container}>
            <div id={styles.podiumContainer}>
                {results.length > 0 && (
                    <PodiumCard player={results[0]} rank={0} />
                )}
                {results.length > 1 && (
                    <PodiumCard player={results[1]} rank={1} />
                )}
                {results.length > 2 && (
                    <PodiumCard player={results[2]} rank={2} />
                )}
            </div>
            <div id={styles.rankingContainer}>
                {results.slice(3).map((player, key) => {
                    return (
                        <div
                            key={key}
                            className={
                                styles.rankingPlayerContainer + " glassy"
                            }
                        >
                            <p
                                className={styles.rankNumber}
                                style={{
                                    background: "#" + player.color,
                                    color: wcHexIsLight(player.color)
                                        ? "unset"
                                        : "var(--background)",
                                }}
                            >
                                {key + 4}
                            </p>
                            <p>{player.username}</p>

                            <p className={styles.rankingPoints}>
                                Points: {player.points}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
