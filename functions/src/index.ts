import { onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { Answers, Game, GamePlayer, Lobby } from "./types";
import { v4 as generateUUID } from "uuid";
import { getRandomSong } from "./utils";
import { BAD_REQUEST, UNAUTHORIZED } from "./responses";

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
        return { code: "403" };
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
        curr_round: 0,
    } as Game);

    batch.update(firestore.doc("/lobbies/" + code), {
        game: uuid,
    });

    let song = getRandomSong();

    batch.create(firestore.doc("/games/" + uuid + "/rounds/0"), {
        lyrics: song.lyrics,
        round_start: Date.now() + 3 * 1000,
        round_end: 0,
    });

    batch.create(firestore.doc("/games/" + uuid + "/rounds/0s"), {
        author: song.author,
        album: song.album,
        release: song.release,
        title: song.title,
    });

    await batch.commit();

    return { status: "100", data: { uuid: uuid } };
});

exports.submitGuess = onCall(async (request) => {
    if (!request.auth) {
        return UNAUTHORIZED;
    }
    if (
        typeof request.data.code !== "string" ||
        typeof request.data.answers !== "object"
    ) {
        return BAD_REQUEST;
    }
    if (
        !(
            typeof request.data.album == "string" &&
            typeof request.data.title === "string" &&
            typeof request.data.release === "number" &&
            typeof request.data.author === "string"
        )
    ) {
        return BAD_REQUEST;
    }

    let answers = request.data.answers as Answers;

    if (typeof request.data.code !== "string") {
        return BAD_REQUEST;
    }

    let code: string = request.data.code;

    let lobby_doc = firestore.doc("/lobbies/" + code);
});
