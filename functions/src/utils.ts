import songs from "./songs";
import { Song } from "./types";

export function getRandomSong(): Song {
    return songs[Math.ceil(Math.random() * (songs.length - 1))];
}
export function getRandomCode(length: number) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
        counter += 1;
    }
    return result;
}
