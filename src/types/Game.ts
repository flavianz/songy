import { GamePlayer, GameState, GameType, Profile } from "./types.ts";
import { httpsCallable } from "firebase/functions";
import { firestore, functions } from "../firebase/firebase.ts";
import { debug } from "../main.tsx";
import { doc, getDoc } from "firebase/firestore";

export class Game {
    public players: {
        [uid: string]: GamePlayer;
    };
    public readonly roundStart: number;
    public readonly totalRounds: number;
    public readonly currRound: number;
    public readonly maxRoundEnd: number;
    public readonly host: string;
    private readonly user: Profile;
    public readonly uuid: string;

    constructor(game: GameType, user: Profile, uuid: string) {
        this.players = game.players;
        this.roundStart = game.roundStart;
        this.totalRounds = game.totalRounds;
        this.currRound = game.currRound;
        this.maxRoundEnd = game.maxRoundEnd;
        this.host = game.host;
        this.uuid = uuid;
        this.user = user;
    }

    public haveAllGuessed(): boolean {
        return Object.values(this.players)
            .map((player) => player.lastGuessRound === this.currRound)
            .reduce((previousValue, currentValue) => {
                {
                    return previousValue && currentValue;
                }
            }, true);
    }

    public hasRoundEnded(): boolean {
        return Date.now() >= this.maxRoundEnd;
    }

    public isLastRound(): boolean {
        return this.currRound + 1 >= this.totalRounds;
    }

    public hasSubmitted(uid: string): boolean {
        return this.players[uid].lastGuessRound === this.currRound;
    }

    public hasRoundStarted(): boolean {
        return Date.now() > this.roundStart;
    }

    public isInGame(): boolean {
        return Object.keys(this.players).includes(this.user.auth.uid);
    }

    public isHost(uid: string): boolean {
        return this.host === uid;
    }

    public getState(): GameState {
        if (this.hasRoundEnded() || this.haveAllGuessed()) {
            return this.isLastRound() ? GameState.FINISHED : GameState.OVERVIEW;
        }
        if (this.hasSubmitted(this.user.auth.uid)) {
            return GameState.SUBMITTED;
        }
        if (this.hasRoundStarted()) {
            return GameState.GUESSING;
        }
        return GameState.COUNTDOWN;
    }

    public async nextRound(): Promise<void> {
        if (!this.isHost(this.user.auth.uid)) {
            return;
        }
        let now = Date.now();
        await httpsCallable(
            functions,
            "nextRound",
        )({
            uuid: this.uuid,
        });
        debug("nextRound function took " + (Date.now() - now) + "ms");
    }

    public async fetchLyrics(): Promise<string | null> {
        if (!this.hasRoundStarted()) {
            return null;
        }
        let lyrics = await getDoc(
            doc(firestore, "/games/" + this.uuid + "/lyrics/" + this.currRound),
        );
        if (!lyrics.exists()) {
            return null;
        }
        return lyrics.data().lyrics as string | null;
    }

    public async calculateGameResults() {
        if (
            this.players[this.user.auth.uid].lastGuessRound === this.totalRounds
        ) {
            return;
        }
        return await httpsCallable(
            functions,
            "calculateGameResults",
        )({
            uuid: this.uuid,
        });
    }

    public getRankedPlayers() {
        return Object.values(this.players).sort((a, b) => b.points - a.points);
    }
}
