import { User } from "firebase/auth";

export interface FirestoreUser {
    auth: User;
    username: string;
    level: number;
    lobby: string;
}

export interface FirestoreLobby {
    host: string;
    max_players: number;
    state: "idle" | "game";
    players: {
        [uid: string]: FirestoreLobbyPlayer;
    };
}

export interface FirestoreLobbyPlayer {
    username: string;
    color: string;
}
