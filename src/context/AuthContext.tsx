import React, { useContext } from "react";
import { User } from "firebase/auth";

export const AuthContext = React.createContext<User | null>(null);

export function getUser() {
    return useContext(AuthContext);
}
