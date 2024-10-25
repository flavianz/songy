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
    const [loggedIn, setLoggedIn] = useState(true);

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (!user) {
                setLoggedIn(false);
                return;
            }
            setLoggedIn(user.emailVerified || allowEmailUnverified);
        });
    }, []);

    return loggedIn ? children : <Navigate to={"/signin"} />;
}
