import { User } from "firebase/auth";

export interface FirestoreUser {
    username: string;
    level: number;
    xp: number;
    lobby: string;
    setup_completed: boolean;
}

export interface Profile extends FirestoreUser {
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

export interface GameType {
    players: {
        [uid: string]: GamePlayer;
    };
    round_start: number;
    total_rounds: number;
    curr_round: number;
    max_round_end: number;
    host: string;
}
export interface Answers {
    author: string;
    title: string;
    album: string;
    release: number;
}
export type Guess = Answers;

export enum GameState {
    COUNTDOWN,
    GUESSING,
    SUBMITTED,
    OVERVIEW,
    FINISHED,
}
export interface Guesses {
    solution: Guess;
    [uid: string]: Guess | null;
}
