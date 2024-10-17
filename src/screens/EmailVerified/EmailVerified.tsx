import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase.ts";
import { createFirebaseUser } from "../../firebase/functions/user.ts";
import { ensureSignOut } from "../../firebase/auth.ts";

export default function EmailVerified() {
    ensureSignOut();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        createFirebaseUser(auth.currentUser?.uid!, "flavianz").then(() =>
            setLoading(false),
        );
    }, []);

    return loading ? (
        <div>
            <p>loading</p>
        </div>
    ) : (
        <div>
            <p>email verified</p>
        </div>
    );
}
