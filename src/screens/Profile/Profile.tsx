import { getUser } from "../../context/AuthContext.tsx";
import { ensureSignOut, signOut } from "../../firebase/auth.ts";
import { fetchUser } from "../../firebase/functions/user.ts";
import { useEffect, useState } from "react";
import { FirestoreUser } from "../../firebase/types.ts";

export default function Profile() {
    ensureSignOut();
    let user = getUser()!;

    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<FirestoreUser | null>(null);

    useEffect(() => {
        fetchUser(user.uid).then((data) => {
            setUserData(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div>
                <p>loading...</p>
            </div>
        );
    }

    return (
        <div>
            <p>Logged in as {user.email}</p>
            <button type={"button"} onClick={() => signOut()}>
                Sign Out
            </button>
            <p>Username: {userData?.username}</p>
        </div>
    );
}
