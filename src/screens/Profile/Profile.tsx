import { getUser } from "../../context/AuthContext.tsx";
import { ensureSignOut, signOut } from "../../firebase/auth.ts";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    ensureSignOut();
    let user = getUser()!;

    const navigate = useNavigate();

    useEffect(() => {});

    return (
        <div>
            <p>Logged in as {user.auth.email}</p>
            <button type={"button"} onClick={() => signOut()}>
                Sign Out
            </button>
            <p>Username: {user.username}</p>
            <button onClick={() => navigate("/")}>Home</button>
        </div>
    );
}
