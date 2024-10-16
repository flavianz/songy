import { User } from "firebase/auth";

export interface FirestoreUser {
    auth: User;
    username: string;
    level: number;
}
