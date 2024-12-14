export interface Song {
    author: string;
    title: string;
    lyrics: string;
    album: string;
    release: number;
}

export interface LobbyPlayer {
    color: string;
    username: string;
}

export interface Lobby {
    host: string;
    maxPlayers: number;
    players: {
        [uid: string]: LobbyPlayer;
    };
    game: string;
}

export interface GamePlayer {
    color: string;
    points: number;
    username: string;
    lastGuessRound: number;
}

export interface Game {
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

export interface Guesses {
    solution: Guess;
    [uid: string]: Guess | null;
}

export type UID = string;
