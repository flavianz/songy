import { User } from "firebase/auth";

export interface FirestoreUser {
    username: string;
    level: number;
    xp: number;
    lobby: string;
    setupCompleted: boolean;
}

export interface Profile extends FirestoreUser {
    auth: User;
}

export interface FirestoreLobby {
    host: string;
    maxPlayers: number;
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
    lastGuessRound: number;
}

export interface GameType {
    players: {
        [uid: string]: GamePlayer;
    };
    roundStart: number;
    totalRounds: number;
    currRound: number;
    maxRoundEnd: number;
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
