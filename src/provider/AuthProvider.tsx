import { ReactElement, ReactNode, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase/firebase.ts";
import { User } from "firebase/auth";

export function AuthProvider({
    children,
    loadingComponent,
}: {
    children: any;
    loadingComponent: ReactElement;
}): ReactNode {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return auth.onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
    }, []);

    return (
        <AuthContext.Provider value={user}>
            {loading ? loadingComponent : children}
        </AuthContext.Provider>
    );
}
