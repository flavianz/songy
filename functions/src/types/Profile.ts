import { getRandomCode } from "../utils";
import { User } from "./User";
import { firestore } from "../index";

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
            data.username,
            data.lobby,
            data.setupCompleted,
            data.level,
            data.xp,
        );
    }

    public static async create(uid: string) {
        try {
            let batch = firestore.batch();
            batch.create(firestore.doc("/users/" + uid), {
                username: "default_" + getRandomCode(8),
                level: 1,
                xp: 0,
                lobby: "",
                setupCompleted: false,
            });
            batch.create(firestore.doc(`/users/${uid}/data/stats`), {
                gameCount: 0,
            });
            await batch.commit();
        } catch (e) {
            throw new Error("Failed to create user", { cause: e });
        }
    }

    public currentLevelRequiredXp(): number {
        return Math.pow(500, this.level);
    }

    public remainingXpToNextLevel(): number {
        return this.currentLevelRequiredXp() - this.xp;
    }
}
