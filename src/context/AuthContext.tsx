import React, { useContext } from "react";
import { FirestoreUser } from "../firebase/types.ts";

export const AuthContext = React.createContext<FirestoreUser | null>(null);

export function getUser() {
    return useContext(AuthContext);
}
