import { wcHexIsLight } from "../../firebase/functions/utils.ts";
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
                                color: wcHexIsLight(player.color)
                                    ? "#000000"
                                    : "#FFFFFF",
                            }}
                        >
                            {player.username} [{player.points}]{" "}
                            {player.lastGuessRound === game.currRound
                                ? "has guesses"
                                : ""}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
