import { ensureSignOut, signOut } from "../../firebase/auth.ts";
import { sendEmailVerification } from "firebase/auth";
import { getUser } from "../../context/AuthContext.tsx";
import { BASE_URL } from "../../main.tsx";

export default function CheckInbox() {
    ensureSignOut(true);
    return (
        <div>
            <p>
                Check Inbox! <br />
                or
            </p>
            <button onClick={() => signOut()}>Sign out</button>
            <button
                onClick={() =>
                    sendEmailVerification(getUser()!.auth, {
                        url: BASE_URL + "email_verified",
                    })
                }
            >
                Resend Email
            </button>
        </div>
    );
}
