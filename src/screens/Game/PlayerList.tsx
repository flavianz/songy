import { Game } from "../../firebase/types.ts";

export default function PlayerList({ game }: { game: Game }) {
    return (
        <div>
            <p>Players:</p>
            {Object.keys(game.players).map((uid, key) => {
                const player = game.players[uid];
                console.log(player);
                return (
                    <div style={{ background: "#" + player.color }} key={key}>
                        <p>
                            {player.username} [{player.points}]{" "}
                            {player.last_guess_round === game.curr_round
                                ? "has guesses"
                                : ""}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
