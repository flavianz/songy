import { signOut } from "../../firebase/auth.ts";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../context/AuthContext.tsx";

export default function Profile() {
    const user = getUser();

    const navigate = useNavigate();

    return (
        <div>
            <p>Logged in as {user?.auth.email}</p>
            <button type={"button"} onClick={() => signOut()}>
                Sign Out
            </button>
            <p>Username: {user?.username}</p>
            <button onClick={() => navigate("/")}>Home</button>
        </div>
    );
}
