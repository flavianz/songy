import { signOut } from "../../firebase/auth.ts";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getUser } from "../../context/AuthContext.tsx";
import { useEffect, useState } from "react";
import { FirestoreUser } from "../../types/types.ts";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase.ts";

export default function Profile() {
    const [profile, setProfile] = useState<FirestoreUser | null | undefined>(
        undefined,
    );
    const navigate = useNavigate();
    let { uid } = useParams();

    if (uid === "me") {
        let user = getUser();
        if (!user) {
            return <Navigate to={"/signin"} />;
        }
        uid = user.auth.uid;
    }

    useEffect(() => {
        getDoc(doc(firestore, "/users/" + uid)).then((result) => {
            setProfile((result.data() as FirestoreUser | undefined) ?? null);
        });
    }, [uid]);

    if (profile === undefined) {
        return <p>loading...</p>;
    }

    if (profile === null) {
        return <p>Profile does not exist</p>;
    }

    let localUid = getUser()?.auth?.uid;

    return (
        <div>
            <p>{profile.username}</p>
            {localUid === uid && (
                <button type={"button"} onClick={() => signOut()}>
                    Sign Out
                </button>
            )}
            <button onClick={() => navigate("/")}>Home</button>
            <p>Level: {profile.level}</p>
        </div>
    );
}
