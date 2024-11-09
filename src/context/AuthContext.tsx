import React, { useContext } from "react";
import { Profile } from "../firebase/types.ts";

export const AuthContext = React.createContext<Profile | null>(null);

export function getUser() {
    return useContext(AuthContext);
}
