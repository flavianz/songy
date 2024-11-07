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
    last_guess_round: number;
}

export interface Game {
    players: {
        [uid: string]: GamePlayer;
    };
    round_start: number;
    total_rounds: number;
    curr_round: number;
    max_round_end: number;
}
export interface Round {
    lyrics: string;
    round_start: number;
    round_end: number;
}

export interface RoundSolution {
    author: string;
    title: string;
    album: string;
    release: number;
}
export interface Answers {
    author: string;
    title: string;
    album: string;
    release: number;
}
export type Guess = Answers;
