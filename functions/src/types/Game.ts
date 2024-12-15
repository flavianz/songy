import { Answers, UID } from "./types";
import { GamePlayer } from "./Player";
import { FieldValue } from "firebase-admin/firestore";
import { v4 as generateUUID } from "uuid";
import { getRandomSong } from "../utils";
import { firestore } from "../index";
import { Profile } from "./Profile";

export class Game {
    public currRound: number;
    public host: UID;
    public maxRoundEnd: number;
    public roundStart: number;
    public totalRounds: number;
    public roundLength: number;
    public players: GamePlayer[];
    public uuid: string;

    constructor(
        currRound: number,
        host: UID,
        maxRoundEnd: number,
        roundStart: number,
        totalRounds: number,
        roundLength: number,
        players: GamePlayer[],
        uuid: string,
    ) {
        this.currRound = currRound;
        this.host = host;
        this.maxRoundEnd = maxRoundEnd;
        this.roundStart = roundStart;
        this.totalRounds = totalRounds;
        this.roundLength = roundLength;
        this.players = players;
        this.uuid = uuid;
    }

    public static async create(
        lobby: string,
        host: UID,
        totalRounds: number,
        roundLength: number,
        players: GamePlayer[],
    ): Promise<Game> {
        const uuid = generateUUID();
        const batch = firestore.batch();
        batch.create(firestore.doc("/games/" + uuid), {
            players: players.reduce(
                (acc, player) => {
                    acc[player.uid] = player.toObject();
                    return acc;
                },
                {} as { [uid: UID]: object },
            ),
            totalRounds: totalRounds,
            roundStart: Date.now() + 3300, // 3 seconds until start, 300 ms latency puffer
            currRound: 0,
            maxRoundEnd: Date.now() + roundLength + 3300,
            roundLength: roundLength,
            host: host,
        });
        batch.update(firestore.doc(`/lobbies/${lobby}`), {
            game: uuid,
        });

        let emptyGuesses: { [id: string]: null } = {};

        for (let player of players) {
            emptyGuesses[player.uid] = null;
        }

        for (let i = 0; i < 5; i++) {
            let song = getRandomSong();
            batch.create(
                firestore.doc("/games/" + uuid + "/guesses/" + i.toString()),
                {
                    solution: {
                        title: song.title,
                        album: song.album,
                        author: song.author,
                        release: song.release,
                    } as Answers,
                    ...emptyGuesses,
                },
            );
            batch.create(
                firestore.doc("/games/" + uuid + "/lyrics/" + i.toString()),
                {
                    lyrics: song.lyrics,
                },
            );
        }

        await batch.commit();

        return new Game(
            0,
            host,
            Date.now() + roundLength + 3300,
            Date.now() + 3300,
            totalRounds,
            roundLength,
            players,
            uuid,
        );
    }

    public static async fetch(uuid: string) {
        const doc = await firestore.doc(`/games/${uuid}`).get();
        if (!doc.exists) {
            throw new Error("Game does not exist");
        }
        const data = doc.data()! as Game;
        return new Game(
            data.currRound,
            data.host,
            data.maxRoundEnd,
            data.roundStart,
            data.totalRounds,
            data.roundLength,
            Object.entries(data.players).map((player) =>
                GamePlayer.fromObject(player[1], player[0]),
            ),
            uuid,
        );
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

    public isHost(uid: string): boolean {
        return this.host === uid;
    }

    public isPlayer(uid: string): boolean {
        return this.players.some((player) => player.uid === uid);
    }

    public getPlayer(uid: string): GamePlayer | null {
        return this.players.find((player) => player.uid === uid) || null;
    }

    public hasPlayerCalculatedResults(uid: string) {
        return this.getPlayer(uid)!.lastGuessRound >= this.totalRounds;
    }

    public getRank(uid: string) {
        return this.players
            .sort((a, b) => b.points - a.points)
            .findIndex((player) => player.uid === uid);
    }

    public getGainedXp(uid: string) {
        return (
            ((this.players.length - this.getRank(uid)) / this.players.length) *
                100 +
            this.getPlayer(uid)!.points
        );
    }

    public async calculateResults(uid: string) {
        const profile = await Profile.fetch(uid);
        let xpTotal = this.getGainedXp(uid) + profile.xp;
        let levelTotal = 0;

        while (xpTotal >= profile.remainingXpToNextLevel()) {
            xpTotal -= profile.remainingXpToNextLevel();
            levelTotal++;
        }
        let batch = firestore.batch();
        batch.update(firestore.doc(`/users/${uid}`), {
            xp: FieldValue.increment(xpTotal),
            level: FieldValue.increment(levelTotal),
        });
        batch.update(firestore.doc(`/users/${uid}/data/stats`), {
            gameCount: FieldValue.increment(1),
        });
        batch.update(firestore.doc(`/games/${this.uuid}`), {
            ["players." + uid + ".lastGuessRound"]: this.totalRounds,
        });
        if (this.isHost(uid)) {
            batch.update(firestore.doc(`/lobbies/${profile.lobby}`), {
                game: "",
            });
        }
        await batch.commit();
    }

    public async nextRound() {
        await firestore.doc(`/games/${this.uuid}`).update({
            currRound: FieldValue.increment(1),
            maxRoundEnd: Date.now() + this.roundLength + 3300,
            roundStart: Date.now() + 3300,
        });
    }

    public hasGameEnded() {
        return (
            (this.hasRoundEnded() || this.haveAllGuessed()) &&
            this.isLastRound()
        );
    }

    public static async addGuessResult(
        uuid: string,
        uid: string,
        round: number,
        points: number,
    ) {
        await firestore.doc(`/games/${uuid}`).update({
            [(("players." + uid) as string) + ".points"]:
                FieldValue.increment(points),
            [(("players." + uid) as string) + ".lastGuessRound"]: round,
        });
    }
}
