import { getUser } from "../../context/AuthContext.tsx";
import { Navigate } from "react-router-dom";
import { signOut } from "../../firebase/auth.ts";
import EnsureSignOut from "../../provider/EnsureSignOut.tsx";

export default function Profile() {
    let user = getUser();

    if (!user) {
        return <Navigate to={"/login"} />;
    }

    return (
        <EnsureSignOut>
            <p>Logged in as {user.email}</p>
            <button type={"button"} onClick={() => signOut()}>
                Sign Out
            </button>
        </EnsureSignOut>
    );
}
