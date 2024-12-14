import { onCall } from "firebase-functions/v2/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { Answers, Guesses } from "./types/types";
import { BadRequest, Forbidden, Ok, Unauthorized } from "./responses";
import { setGlobalOptions } from "firebase-functions/v2";
import functions = require("firebase-functions/v1");
import { Profile } from "./types/Profile";
import { Lobby } from "./types/Lobby";
import { Game } from "./types/Game";

initializeApp();

setGlobalOptions({ region: "europe-west1" });

exports.startGame = onCall(async (request) => {
    if (!request.auth) {
        return Unauthorized;
    }
    if (typeof request.data.code !== "string") {
        return BadRequest;
    }

    let code: string = request.data.code;
    let lobby;
    try {
        lobby = await Lobby.fetch(code);
    } catch (e) {
        return BadRequest;
    }

    if (!lobby.isHost(request.auth.uid)) {
        return Forbidden;
    }

    let game = await Game.create(
        code,
        request.auth.uid,
        5,
        1.5 * 60 * 1000,
        lobby.getGamePlayers(),
    );

    return Ok({ uuid: game.uuid });
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

        let after = event.data.after.data() as Guesses;

        let solution = after.solution;
        let myGuess = after[authId as string] as Answers;

        let roundPoints = 0;
        if (solution.title.toLowerCase() === myGuess.title.toLowerCase()) {
            roundPoints += 10;
        }
        if (solution.album.toLowerCase() === myGuess.album.toLowerCase()) {
            roundPoints += 10;
        }
        if (solution.author.toLowerCase() === myGuess.author.toLowerCase()) {
            roundPoints += 10;
        }

        roundPoints += Math.floor(
            100 / (Math.abs(solution.release - myGuess.release) + 10),
        );

        await Game.addGuessResult(
            event.params.gameDoc,
            authId,
            parseInt(event.params.roundDoc),
            roundPoints,
        );
    },
);

// potential elimination of function for direct change of the document
exports.nextRound = onCall(async (request) => {
    if (!request.auth) {
        return Unauthorized;
    }
    if (typeof request.data.uuid !== "string") {
        return BadRequest;
    }
    const uuid = request.data.uuid as string;

    let game;
    try {
        game = await Game.fetch(uuid);
    } catch (e) {
        return BadRequest;
    }

    if (!game.isHost(request.auth.uid)) {
        return Forbidden;
    }

    if (!game.haveAllGuessed() && !game.hasRoundEnded()) {
        return Forbidden;
    }
    if (game.isLastRound()) {
        return Forbidden;
    }
    await game.nextRound();

    return Ok();
});

exports.onSignup = functions
    .region("europe-west1")
    .auth.user()
    .onCreate(async (user) => {
        try {
            await Profile.create(user.uid);
        } catch (e) {
            console.error(
                `Failed to create user document for user '${user.uid}'`,
                e,
            );
        }
    });
