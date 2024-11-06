import { onCall } from "firebase-functions/v2/https";
import functions = require("firebase-functions");
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

// using 1st gen api because 2nd gen is not working with auth context
// (not detecting the firestore multi-region database)
exports.submitGuess = functions
    .region("europe-west1")
    .firestore.document("/games/{gameDoc}/guesses/{roundDoc}")
    .onUpdate(async (event, context) => {
        // user ensured to be logged in
        if (!context.auth) {
            console.error("guess doc updated without auth context");
            return;
        }
        const authId = context.auth.uid;

        let after = event.after.data() as Guesses;

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

        round_points = Math.max(
            10 - Math.abs(solution.release - my_guess.release),
            0,
        ); // possibly implement another way of calculating points

        let batch = firestore.batch();

        batch.update(firestore.doc("/games/" + context.params.gameDoc), {
            [(("players." + authId) as string) + ".points"]:
                FieldValue.increment(round_points),
        });

        const round_length = 1.5 * 60 * 1000;

        if (!Object.values(after).includes(null)) {
            // all have guessed
            batch.update(firestore.doc("/games/" + context.params.gameDoc), {
                curr_round: FieldValue.increment(1),
                round_start: Date.now() + 8300,
                max_round_end: Date.now() + round_length + 8300,
            });
        }

        await batch.commit();
    });
