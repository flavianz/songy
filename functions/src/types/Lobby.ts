import { UID } from "./types";
import { GamePlayer, Player } from "./Player";
import { firestore } from "../index";

export class Lobby {
    public code: string;
    public game: string;
    public host: UID;
    public maxPlayers: number;
    public players: Player[];

    constructor(
        code: string,
        game: string,
        host: UID,
        maxPlayers: number,
        players: Player[],
    ) {
        this.code = code;
        this.game = game;
        this.host = host;
        this.maxPlayers = maxPlayers;
        this.players = players;
    }

    public static async fetch(code: string): Promise<Lobby> {
        const doc = await firestore.doc(`/lobbies/${code}`).get();
        if (!doc.exists) {
            throw new Error("Lobby does not exist");
        }
        const data = doc.data()!;
        return new Lobby(
            data.code,
            data.game,
            data.host,
            data.maxPlayers,
            Object.entries(data.players).map((player) => {
                return Player.fromObject(player[1], player[0]);
            }),
        );
    }

    public getGamePlayers(): GamePlayer[] {
        return this.players.map((player) => player.toGamePlayer());
    }

    public isHost(uid: string): boolean {
        return this.host === uid;
    }
}
