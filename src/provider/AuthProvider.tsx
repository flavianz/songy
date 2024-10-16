import { ReactElement, ReactNode, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase/firebase.ts";
import { FirestoreUser } from "../firebase/types.ts";
import { fetchUser } from "../firebase/functions/user.ts";

export function AuthProvider({
    children,
    loadingComponent,
}: {
    children: any;
    loadingComponent: ReactElement;
}): ReactNode {
    const [user, setUser] = useState<FirestoreUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return auth.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                fetchUser(firebaseUser.uid).then((data) => {
                    setUser({ ...data, auth: firebaseUser });
                    setLoading(false);
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });
    }, []);

    return (
        <AuthContext.Provider value={user}>
            {loading ? loadingComponent : children}
        </AuthContext.Provider>
    );
}
