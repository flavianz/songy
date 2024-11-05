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
    max_players: number;
    players: {
        [uid: string]: LobbyPlayer;
    };
    game: string;
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
    round_start: number;
    total_rounds: number;
    curr_round: number;
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
