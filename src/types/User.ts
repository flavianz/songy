export class User {
    public readonly uid: string;
    public username: string;

    constructor(uid: string, username: string) {
        this.uid = uid;
        this.username = username;
    }
}
