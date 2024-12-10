import styles from "./Setup.module.css";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase.ts";
import { getUser } from "../../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";

export default function Setup() {
    const [error, setError] = useState<string>("");
    const [username, setUsername] = useState("");
    let user = getUser()!;

    const navigate = useNavigate();

    async function handleSubmit() {
        if (username.length < 3) setError("Username too short!");
        if (username.length > 30) setError("Username too long!");

        await updateDoc(doc(firestore, "/users/" + user.auth.uid), {
            username: username,
            setup_completed: true,
        });
    }

    useEffect(() => {
        if (user.setup_completed) {
            navigate("/profile");
        }
    }, [user]);

    return (
        <div id={styles.container}>
            <h1 id={styles.header}>Few things left to do</h1>
            <h2 id={styles.subHeader}>Create your username</h2>
            <input
                className={"glassy"}
                type="text"
                placeholder={"Choose wisely!"}
                id={styles.input}
                onChange={(e) => setUsername(e.target.value)}
            />
            <button
                id={styles.button}
                className={"glassy"}
                onClick={handleSubmit}
            >
                Submit
            </button>
            <h3 id={styles.error}>{error}</h3>
        </div>
    );
}
