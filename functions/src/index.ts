import { onRequest } from "firebase-functions/v2/https";

exports.startGame = onRequest(async (req, res) => {
    res.send("Hello World!");
});
