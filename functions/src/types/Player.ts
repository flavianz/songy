import { User } from "./User";
import { UID } from "./types";

export class Player extends User {
    public color: string;

    constructor(uid: UID, username: string, color: string) {
        super(uid, username);
        this.color = color;
    }

    public toGamePlayer(): GamePlayer {
        return new GamePlayer(this.uid, this.username, this.color, 0, -1);
    }
}

export class GamePlayer extends Player {
    public points: number;
    public lastGuessRound: number;

    constructor(
        uid: UID,
        username: string,
        color: string,
        points: number,
        lastGuessRound: number,
    ) {
        super(uid, username, color);
        this.points = points;
        this.lastGuessRound = lastGuessRound;
    }

    public static fromObject(obj: any, uid: UID): GamePlayer {
        return new GamePlayer(
            uid,
            obj.username,
            obj.color,
            obj.points,
            obj.lastGuessRound,
        );
    }

    public toObject(): object {
        return {
            username: this.username,
            color: this.color,
            points: this.points,
            lastGuessRound: this.lastGuessRound,
        };
    }
}
