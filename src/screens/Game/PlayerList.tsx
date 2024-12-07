import { wc_hex_is_light } from "../../firebase/functions/utils.ts";
import { Game } from "../../types/Game.ts";

export default function PlayerList({ game }: { game: Game }) {
    return (
        <div>
            <p>Players:</p>
            {Object.keys(game.players).map((uid, key) => {
                const player = game.players[uid];
                return (
                    <div style={{ background: "#" + player.color }} key={key}>
                        <p
                            style={{
                                color: wc_hex_is_light(player.color)
                                    ? "#000000"
                                    : "#FFFFFF",
                            }}
                        >
                            {player.username} [{player.points}]{" "}
                            {player.last_guess_round === game.currRound
                                ? "has guesses"
                                : ""}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
