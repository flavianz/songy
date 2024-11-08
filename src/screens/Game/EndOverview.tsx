import { Game } from "../../firebase/types.ts";

export default function EndOverview({ game }: { game: Game }) {
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
        </div>
    );
}
interface ResultPlayer {
    username: string;
    id: string;
    points: number;
}
