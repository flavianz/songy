import { User } from "./User.ts";

export class Player extends User {
    public color: string;

    constructor(uid: string, username: string, color: string) {
        super(uid, username);
        this.color = color;
    }
}

export class GamePlayer extends Player {
    public points: number;
    public lastGuessRound: number;

    constructor(
        uid: string,
        username: string,
        color: string,
        points: number,
        lastGuessRound: number,
    ) {
        super(uid, username, color);
        this.points = points;
        this.lastGuessRound = lastGuessRound;
    }
}
