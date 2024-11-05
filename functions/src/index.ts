import { onCall, onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { Answers, Game, GamePlayer, Guesses, Lobby } from "./types";
import { v4 as generateUUID } from "uuid";
import { getRandomSong } from "./utils";
import {
    BAD_REQUEST,
    FORBIDDEN,
    INTERNAL_ERROR,
    OK,
    UNAUTHORIZED,
} from "./responses";

initializeApp();
const firestore = getFirestore();

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

    batch.create(firestore.doc("/games/" + uuid), {
        players: gamePlayers,
        total_rounds: 5,
        round_start: Date.now() + 3300, // 3 seconds until start, 300 ms latency puffer
        curr_round: 0,
    } as Game);

    batch.update(firestore.doc("/lobbies/" + code), {
        game: uuid,
    });

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
            },
        );
    }

    await batch.commit();

    return OK({ uuid: uuid });
});

exports.roundEnd = onRequest((request, response) => {
    console.log("Received roundEnd", request);
});

exports.submitGuess = onCall(async (request) => {
    if (!request.auth) {
        return UNAUTHORIZED;
    }

    //ensure answers are in payload
    if (
        typeof request.data.code !== "string" ||
        typeof request.data.answers !== "object"
    ) {
        return BAD_REQUEST;
    }
    if (
        !(
            typeof request.data.album === "string" &&
            typeof request.data.title === "string" &&
            typeof request.data.release === "number" &&
            typeof request.data.author === "string"
        )
    ) {
        return BAD_REQUEST;
    }

    let answers = request.data.answers as Answers;

    // retrieve uuid
    if (typeof request.data.uuid !== "string") {
        return BAD_REQUEST;
    }
    let uuid: string = request.data.uuid;

    let game_snapshot = await firestore.doc("/games/" + uuid).get();
    if (!game_snapshot.exists) {
        return BAD_REQUEST;
    }

    // ensure user is in game
    let game = game_snapshot.data() as Game;
    if (!Object.keys(game).includes(request.auth.uid)) {
        return FORBIDDEN;
    }

    let guesses_snapshot = await firestore
        .doc("/games/" + uuid + "/guesses/0")
        .get();
    if (!guesses_snapshot.exists) {
        return INTERNAL_ERROR;
    }
    let guesses_doc = guesses_snapshot.data() as Guesses;

    // check if user has already submitted a guess
    if (request.auth.uid in guesses_doc) {
        return FORBIDDEN;
    }

    let end = game.rounds[game.rounds.length - 1].end;
    if (end + 300 < Date.now()) {
        // time expired, with 300 ms buffer to avoid unexpected behavior
        return FORBIDDEN;
    }

    if (end === 0) {
    }
});
