import React, { useContext } from "react";
import { Profile } from "../types/types.ts";

export const AuthContext = React.createContext<Profile | null>(null);

export function getUser() {
    return useContext(AuthContext);
}
