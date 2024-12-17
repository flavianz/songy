import { DocumentData } from "firebase/firestore";
import { Player } from "./Player.ts";
import { Profile } from "./types.ts";

export class Lobby {
    public game: string;
    public host: string;
    public maxPlayers: number;
    public players: { [uid: string]: Player };
    public profile: Profile;
    public code: string;

    constructor(lobby: DocumentData, profile: Profile, code: string) {
        this.game = lobby.game;
        this.host = lobby.host;
        this.maxPlayers = lobby.maxPlayers;
        this.players = lobby.players;
        this.profile = profile;
        this.code = code;
    }

    public isInGame(uid?: string): boolean {
        uid = uid || this.host;
        return Object.keys(this.players).includes(uid);
    }
}
