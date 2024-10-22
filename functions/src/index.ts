import { onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/lib/firestore";
import { initializeApp } from "firebase-admin/lib/app";
import songs from "./songs";

initializeApp();
const firestore = getFirestore();

exports.startGame = onCall(async (request) => {
    let song = songs[Math.ceil(Math.random() * (songs.length - 1))];
});
