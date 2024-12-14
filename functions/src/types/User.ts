import { UID } from "./types";

export class User {
    public readonly uid: UID;
    public username: string;

    constructor(uid: UID, username: string) {
        this.uid = uid;
        this.username = username;
    }
}
