import { ReactElement, ReactNode, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { auth, firestore } from "../firebase/firebase.ts";
import { FirestoreUser } from "../firebase/types.ts";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";

export function AuthProvider({
    children,
    loadingComponent,
}: {
    children: any;
    loadingComponent: ReactElement;
}): ReactNode {
    const [user, setUser] = useState<FirestoreUser | null>(null);
    const [loading, setLoading] = useState(true);

    let unsubscribe: Unsubscribe;

    useEffect(() => {
        return auth.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                if (unsubscribe !== undefined) {
                    unsubscribe();
                }
                alert("resubscribe");
                unsubscribe = onSnapshot(
                    doc(firestore, "users", firebaseUser.uid),
                    async (doc) => {
                        alert("fetch user");
                        if (!doc.exists()) {
                            await auth.signOut();
                            return;
                        }
                        setUser({
                            ...(doc.data() as FirestoreUser),
                            auth: firebaseUser,
                        });
                        setLoading(false);
                    },
                );
            } else {
                if (unsubscribe !== undefined) {
                    unsubscribe();
                }
                setUser(null);
                setLoading(false);
            }
        });
    }, []);

    return (
        <AuthContext.Provider value={user}>
            {loading ? loadingComponent : children}
        </AuthContext.Provider>
    );
}
