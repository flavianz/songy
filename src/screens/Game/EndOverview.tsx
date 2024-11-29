import { Game } from "../../firebase/types.ts";
import { getUser } from "../../context/AuthContext.tsx";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase.ts";
import { useNavigate } from "react-router-dom";
import styles from "./EndOverview.module.css";

export default function EndOverview({ game }: { game: Game }) {
    const navigate = useNavigate();
    let user = getUser()!;
    let results = [
        { username: "first", id: "", points: 100, color: "ff7700" },
        { username: "second", id: "", points: 80, color: "77ff00" },
        { username: "third", id: "", points: 60, color: "0077ff" },
        {
            username: "fourth",
            id: "",
            points: 40,
            color: "00ff77",
        },
        { username: "fifth", id: "", points: 20, color: "ff0077" },
    ]; /*Object.entries(game.players).map((player) => {
        return {
            username: player[1].username,
            id: player[0],
            points: player[1].points,
            color: player[1].color,
        } as ResultPlayer;
    });*/

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

    function returnToLobby() {
        navigate("/lobby/" + user.lobby);
    }

    async function endGame() {
        await updateDoc(doc(firestore, "/lobbies/" + user.lobby), {
            game: "",
        });
        returnToLobby();
    }

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
                    <p>{rank == 0 ? "1st" : rank == 1 ? "2nd" : "3rd"}</p>
                </div>
                <p className={styles.podiumUsername}>
                    {player.username === user.username
                        ? "You"
                        : player.username}
                </p>
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
            {results.slice(3).map((player, key) => {
                return (
                    <div
                        key={key}
                        className={styles.rankingPlayerContainer + " glassy"}
                    >
                        <p>{key + 4}.</p>
                        <p>{player.username}</p>
                        <p>{player.points}</p>
                    </div>
                );
            })}
            {game.host === user.auth.uid ? (
                <button onClick={endGame}>End game</button>
            ) : (
                <button onClick={returnToLobby}>Return to lobby</button>
            )}
        </div>
    );
}

interface ResultPlayer {
    color: string;
    username: string;
    id: string;
    points: number;
}
