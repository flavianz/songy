import { onCall } from "firebase-functions/v2/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { Answers, Game, GamePlayer, Guesses, Lobby } from "./types";
import { v4 as generateUUID } from "uuid";
import { getRandomSong } from "./utils";
import { BAD_REQUEST, FORBIDDEN, OK, UNAUTHORIZED } from "./responses";
import { setGlobalOptions } from "firebase-functions/v2";

initializeApp();
const firestore = getFirestore();

setGlobalOptions({ region: "europe-west4" });

exports.startGame = onCall(async (request) => {
    if (!request.auth) {
        return UNAUTHORIZED;
    }
    if (typeof request.data.code !== "string") {
        return BAD_REQUEST;
    }

    let code: string = request.data.code;

    let lobby_doc = await firestore.doc("/lobbies/" + code).get();
    if (!lobby_doc.exists) {
        return BAD_REQUEST;
    }
    const lobby = lobby_doc.data() as Lobby;
    if (lobby.host !== request.auth.uid) {
        return FORBIDDEN;
    }

    let uuid = generateUUID();

    let gamePlayers: { [uid: string]: GamePlayer } = {};
    for (let player of Object.keys(lobby.players)) {
        gamePlayers[player] = {
            ...lobby.players[player],
            points: 0,
            last_guess_round: -1,
        };
    }

    let batch = firestore.batch();

    const round_length = 1.5 * 60 * 1000;

    batch.create(firestore.doc("/games/" + uuid), {
        players: gamePlayers,
        total_rounds: 5,
        round_start: Date.now() + 3300, // 3 seconds until start, 300 ms latency puffer
        curr_round: 0,
        max_round_end: Date.now() + round_length + 3300,
        host: lobby.host,
    } as Game);

    batch.update(firestore.doc("/lobbies/" + code), {
        game: uuid,
    });

    let empty_guesses: { [id: string]: null } = {};

    for (let uid of Object.keys(lobby.players)) {
        empty_guesses[uid] = null;
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
                ...empty_guesses,
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

    return OK({ uuid: uuid });
});

exports.submitGuess = onDocumentUpdated(
    "/games/{gameDoc}/guesses/{roundDoc}",
    async (event) => {
        if (!event.data) {
            console.error("updated guess with no data");
            return;
        }

        let authId = "";
        for (let uid of Object.keys(event.data.before.data())) {
            if (
                event.data.before.data()[uid] === null &&
                event.data.after.data()[uid] !== null
            ) {
                authId = uid;
            }
        }

        console.log("auth", authId);

        let after = event.data.after.data() as Guesses;

        let solution = after.solution;
        let my_guess = after[authId as string] as Answers;

        let round_points = 0;
        if (solution.title.toLowerCase() === my_guess.title.toLowerCase()) {
            round_points += 10;
        }
        if (solution.album.toLowerCase() === my_guess.album.toLowerCase()) {
            round_points += 10;
        }
        if (solution.author.toLowerCase() === my_guess.author.toLowerCase()) {
            round_points += 10;
        }

        round_points += Math.floor(
            100 / (Math.abs(solution.release - my_guess.release) + 10),
        );

        await firestore.doc("/games/" + event.params.gameDoc).update({
            [(("players." + authId) as string) + ".points"]:
                FieldValue.increment(round_points),
            [(("players." + authId) as string) + ".last_guess_round"]: parseInt(
                event.params.roundDoc,
            ),
        });
    },
);

// potential elimination of function for direct change of the document
exports.nextRound = onCall(async (request) => {
    if (!request.auth) {
        return UNAUTHORIZED;
    }
    if (typeof request.data.uuid !== "string") {
        return BAD_REQUEST;
    }
    const uuid = request.data.uuid as string;

    const game_doc = await firestore.doc("/games/" + uuid).get();
    if (!game_doc.exists) {
        return BAD_REQUEST;
    }
    const game = game_doc.data() as Game;

    if (game.host !== request.auth.uid) {
        return FORBIDDEN;
    }

    let allPlayersSubmitted = Object.values(game.players)
        .map((player) => player.last_guess_round === game.curr_round)
        .reduce((previousValue, currentValue) => {
            {
                return previousValue && currentValue;
            }
        }, true);
    if (!allPlayersSubmitted && !(game.max_round_end < Date.now())) {
        return FORBIDDEN;
    }
    if (game.curr_round + 1 == game.total_rounds) {
        return FORBIDDEN;
    }
    const round_length = 1.5 * 60 * 1000;
    await firestore.doc("/games/" + uuid).update({
        curr_round: FieldValue.increment(1),
        max_round_end: Date.now() + round_length + 3300,
        round_start: Date.now() + 3300,
    });

    return OK();
});
