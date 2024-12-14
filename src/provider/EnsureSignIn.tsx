import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../context/AuthContext.tsx";

export default function EnsureSignIn({
    children,
    allowEmailUnverified = false,
    allowSetupIncomplete = false,
}: {
    children: ReactNode;
    allowEmailUnverified?: boolean;
    allowSetupIncomplete?: boolean;
}) {
    let user = getUser();
    if (!user) {
        return <Navigate to={"/signin"} />;
    }
    if (!(user.auth.emailVerified || allowEmailUnverified)) {
        return <Navigate to={"/check_inbox"} />;
    }
    if (!(user.setupCompleted || allowSetupIncomplete)) {
        return <Navigate to={"/setup"} />;
    }

    return <div>{children}</div>;
}
