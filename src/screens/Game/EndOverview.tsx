import { Game } from "../../firebase/types.ts";
import { getUser } from "../../context/AuthContext.tsx";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase.ts";
import { useNavigate } from "react-router-dom";

export default function EndOverview({ game }: { game: Game }) {
    const navigate = useNavigate();
    let user = getUser()!;
    let results = Object.entries(game.players).map((player) => {
        return {
            username: player[1].username,
            id: player[0],
            points: player[1].points,
        } as ResultPlayer;
    });

    function comparePlayers(a: ResultPlayer, b: ResultPlayer) {
        if (a.points < b.points) {
            return -1;
        }
        if (a.points > b.points) {
            return 1;
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

    return (
        <div>
            {results.map((player, key) => {
                return (
                    <div key={key} style={{ display: "flex" }}>
                        <p>{key + 1}.</p>
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
    username: string;
    id: string;
    points: number;
}
