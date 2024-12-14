import { Answers, UID } from "./types";
import { GamePlayer } from "./Player";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { v4 as generateUUID } from "uuid";
import { getRandomSong } from "../utils";

const firestore = getFirestore();
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
            players: players.map((player) => player.toObject()),
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

    public async nextRound() {
        await firestore.doc(`/games/${this.uuid}`).update({
            currRound: FieldValue.increment(1),
            maxRoundEnd: Date.now() + this.roundLength + 3300,
            roundStart: Date.now() + 3300,
        });
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
