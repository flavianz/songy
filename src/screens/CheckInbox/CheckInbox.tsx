import { signOut } from "../../firebase/auth.ts";
import EnsureSignOut from "../../provider/EnsureSignOut.tsx";
import { sendEmailVerification } from "firebase/auth";
import { getUser } from "../../context/AuthContext.tsx";
import { BASE_URL } from "../../main.tsx";

export default function CheckInbox() {
    return (
        <EnsureSignOut allowEmailUnverified>
            <p>
                Check Inbox! <br />
                or
            </p>
            <button onClick={() => signOut()}>Sign out</button>
            <button
                onClick={() =>
                    sendEmailVerification(getUser()!, {
                        url: BASE_URL + "email_verified",
                    })
                }
            >
                Resend Email
            </button>
        </EnsureSignOut>
    );
}
