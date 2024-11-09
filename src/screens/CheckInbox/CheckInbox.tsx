import { signOut } from "../../firebase/auth.ts";
import { sendEmailVerification } from "firebase/auth";
import { BASE_URL } from "../../main.tsx";
import { auth } from "../../firebase/firebase.ts";

export default function CheckInbox() {
    return (
        <div>
            <p>
                Check Inbox! <br />
                or
            </p>
            <button onClick={() => signOut()}>Sign out</button>
            <button
                onClick={() =>
                    sendEmailVerification(auth.currentUser!, {
                        url: BASE_URL + "email_verified",
                    })
                }
            >
                Resend Email
            </button>
        </div>
    );
}
