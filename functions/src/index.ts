import { onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getRandomSong } from "./utils";
import { Game, Lobby } from "./types";
import { v4 as generateUUID } from "uuid";

initializeApp();
const firestore = getFirestore();

exports.startGame = onCall(async (request) => {
    if (!request.auth) {
        return { status: "missing permission" };
    }
    if (typeof request.data.code !== "string") {
        return { status: "invalid data" };
    }

    let code: string = request.data.code;
    let song = getRandomSong();

    let lobby = (await firestore.doc("/lobbies/" + code).get()).data() as
        | Lobby
        | undefined;
    if (!lobby) {
        return { status: "invalid data" };
    }
    if (lobby.host !== request.auth.uid) {
        return { status: "missing permission" };
    }

    let uuid = generateUUID();

    await firestore.doc("/games/" + uuid).create({
        curr_round: 0,
        lyrics: song.lyrics,
        players: lobby.players,
        total_rounds: 5,
    } as Game);

    return { status: "ok", uuid: uuid };
});
