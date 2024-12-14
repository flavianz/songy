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

export function wcHexIsLight(color: string) {
    const c_r = parseInt(color.substring(0, 2), 16);
    const c_g = parseInt(color.substring(2, 4), 16);
    const c_b = parseInt(color.substring(4, 6), 16);
    const brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000;
    return brightness > 155;
}

export function getRandomHex() {
    return Math.floor(Math.random() * 16777215).toString(16);
}
