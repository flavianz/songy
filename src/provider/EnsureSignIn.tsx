import { ReactNode, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.ts";
import { Navigate } from "react-router-dom";

export default function EnsureSignIn({
    children,
    allowEmailUnverified = false,
}: {
    children: ReactNode;
    allowEmailUnverified?: boolean;
}) {
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            setLoading(true);
            if (!user) {
                setLoggedIn(false);
                setLoading(false);
                return;
            }
            setLoggedIn(user.emailVerified || allowEmailUnverified);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <p>loading</p>;
    }

    return loggedIn ? <div>{children}</div> : <Navigate to={"/signin"} />;
}
