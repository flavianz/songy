import { getUser } from "../../context/AuthContext.tsx";
import styles from "./EndOverview.module.css";
import { wc_hex_is_light } from "../../firebase/functions/utils.ts";
import { Game } from "../../firebase/types.ts";

export default function EndOverview({ game }: { game: Game }) {
    let user = getUser()!;
    let results = Object.entries(game.players).map((player) => {
        return {
            username: player[1].username,
            id: player[0],
            points: player[1].points,
            color: player[1].color,
        } as ResultPlayer;
    });

    function comparePlayers(a: ResultPlayer, b: ResultPlayer) {
        if (a.points < b.points) {
            return 11;
        }
        if (a.points > b.points) {
            return -1;
        }
        return 0;
    }

    results.sort(comparePlayers);

    function PodiumCard({
        player,
        rank,
    }: {
        player: ResultPlayer;
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
                            color: wc_hex_is_light(player.color)
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
                                    color: wc_hex_is_light(player.color)
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

interface ResultPlayer {
    color: string;
    username: string;
    id: string;
    points: number;
}
