import { getUser } from "../../context/AuthContext.tsx";
import { Navigate } from "react-router-dom";
import { signOut } from "../../firebase/auth.ts";

export default function Profile() {
    let user = getUser();

    if (!user) {
        return <Navigate to={"/login"} />;
    }

    return (
        <div>
            <p>Loggen in as {user.email}</p>
            <button type={"button"} onClick={() => signOut()}>
                Sign Out
            </button>
        </div>
    );
}
