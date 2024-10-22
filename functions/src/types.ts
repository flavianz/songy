export interface Song {
    author: string;
    title: string;
    lyrics: string;
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
    state: "idle" | "game";
}

export interface GamePlayer {
    color: string;
    points: number;
    username: string;
}

export interface Game {
    curr_round: number;
    players: {
        [uid: string]: GamePlayer;
    };
    total_rounds: number;
    lyrics: string;
}
