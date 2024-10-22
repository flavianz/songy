import { getFunctions } from "firebase/functions";
export function getRandomCode() {
    return Math.random().toString(36).slice(2, 6).toUpperCase();
}

export function wc_hex_is_light(color: string) {
    const c_r = parseInt(color.substring(0, 2), 16);
    const c_g = parseInt(color.substring(2, 4), 16);
    const c_b = parseInt(color.substring(4, 6), 16);
    const brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000;
    return brightness > 155;
}

export function getRandomHex() {
    return Math.floor(Math.random() * 16777215).toString(16);
}

export const functions = getFunctions();
