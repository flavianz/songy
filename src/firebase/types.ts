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
    game: string;
    players: {
        [uid: string]: FirestoreLobbyPlayer;
    };
}

export interface FirestoreLobbyPlayer {
    username: string;
    color: string;
}

export interface GamePlayer {
    color: string;
    points: number;
    username: string;
}

export interface Game {
    players: {
        [uid: string]: GamePlayer;
    };
    total_rounds: number;
    curr_round: number;
}
