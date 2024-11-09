import { ReactElement, ReactNode, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { auth, firestore } from "../firebase/firebase.ts";
import { FirestoreUser } from "../firebase/types.ts";
import { doc, onSnapshot } from "firebase/firestore";
import { User } from "firebase/auth";
import { debug } from "../main.tsx";

export function AuthProvider({
    children,
    loadingComponent,
}: {
    children: any;
    loadingComponent: ReactElement;
}): ReactNode {
    const [firestoreUser, setFirestoreUser] = useState<FirestoreUser | null>(
        null,
    );
    const [authUser, setAuthUser] = useState<User | null | undefined>(
        undefined,
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return auth.onAuthStateChanged((firebaseUser) => {
            debug("auth state changed");
            setAuthUser(firebaseUser);
        });
    }, []);

    useEffect(() => {
        if (authUser === undefined) {
            return;
        }
        if (!authUser) {
            setFirestoreUser(null);
            setLoading(false);
            return;
        }

        let unsubscribe = onSnapshot(
            doc(firestore, "/users/" + authUser.uid),
            async (doc) => {
                if (!doc.exists()) {
                    await auth.signOut();
                    return;
                }
                setFirestoreUser(doc.data() as FirestoreUser);
                setLoading(false);
            },
            (e) => {
                debug("error in user fetching", e.customData);
                console.error(e);
            },
        );

        return () => unsubscribe();
    }, [authUser]);

    return (
        <AuthContext.Provider
            value={
                !authUser || !firestoreUser
                    ? null
                    : { ...firestoreUser, auth: authUser }
            }
        >
            {loading ? loadingComponent : children}
        </AuthContext.Provider>
    );
}
