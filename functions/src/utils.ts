import songs from "./songs";
import { Song } from "./types";

export function getRandomSong(): Song {
    return songs[Math.ceil(Math.random() * (songs.length - 1))];
}
