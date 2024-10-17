import { ensureSignOut, signOut } from "../../firebase/auth.ts";
import { sendEmailVerification } from "firebase/auth";
import { BASE_URL } from "../../main.tsx";
import { getUser } from "../../context/AuthContext.tsx";

export default function CheckInbox() {
    ensureSignOut(true);
    let user = getUser()!;
    return (
        <div>
            <p>
                Check Inbox! <br />
                or
            </p>
            <button onClick={() => signOut()}>Sign out</button>
            <button
                onClick={() =>
                    sendEmailVerification(user.auth, {
                        url: BASE_URL + "email_verified",
                    })
                }
            >
                Resend Email
            </button>
        </div>
    );
}
