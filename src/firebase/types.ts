import { User } from "firebase/auth";

export interface FirestoreUser {
    auth: User;
    username: string;
    level: number;
}

export interface FirestoreLobby {
    host: string;
    max_players: number;
    state: "idle" | "game";
    players: FirestoreLobbyPlayer[];
}

export interface FirestoreLobbyPlayer {
    uid: string;
    username: string;
    color: string;
}
