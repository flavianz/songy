import { User } from "firebase/auth";

export interface FirestoreUser {
    username: string;
    level: number;
    lobby: string;
    auth: User;
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
