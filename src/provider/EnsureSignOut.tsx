import { ReactElement } from "react";
import { getUser } from "../context/AuthContext.tsx";
import { Navigate } from "react-router-dom";

export default function EnsureSignOut({
    children,
    allowEmailUnverified = false,
}: {
    children: ReactElement[];
    allowEmailUnverified?: boolean;
}): ReactElement {
    let user = getUser();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!user.emailVerified && !allowEmailUnverified) {
        return <Navigate to="/check_inbox" />;
    }

    return <div>{children}</div>;
}
