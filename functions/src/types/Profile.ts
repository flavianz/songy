import { getFirestore } from "firebase-admin/lib/firestore";
import { getRandomCode } from "../utils";
import { User } from "./User";

const firestore = getFirestore();
export class Profile extends User {
    public lobby: string;
    public setupCompleted: string;
    public level: number;
    public xp: number;

    constructor(
        uid: string,
        username: string,
        lobby: string,
        setupCompleted: string,
        level: number,
        xp: number,
    ) {
        super(uid, username);
        this.lobby = lobby;
        this.setupCompleted = setupCompleted;
        this.level = level;
        this.xp = xp;
    }

    public static async fetch(uid: string) {
        let doc = await firestore.doc("/users/" + uid).get();
        if (!doc.exists) {
            throw new Error("User does not exist");
        }
        let data = doc.data()!;
        return new Profile(
            uid,
            data.lobby,
            data.setupCompleted,
            data.username,
            data.level,
            data.xp,
        );
    }

    public static async create(uid: string) {
        try {
            await firestore.doc("/users/" + uid).create({
                username: "default_" + getRandomCode(8),
                level: 0,
                xp: 0,
                lobby: "",
                setupCompleted: false,
            });
        } catch (e) {
            throw new Error("Failed to create user", { cause: e });
        }
    }
}
