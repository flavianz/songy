import styles from "./Home.module.css";
import { getUser } from "../../context/AuthContext.tsx";

export default function Home() {
    const user = getUser();
    return (
        <div id={styles.container}>
            <h1>Songy</h1>
            <div id={styles.playContainer}>
                <a href="/lobby/create" className={styles.playButton}>
                    <h3>Create Lobby</h3>
                    <p>Create a lobby for you and your friends</p>
                </a>
                <a href="/lobby/join" className={styles.playButton}>
                    <h3>Join</h3>
                    <p>Join an existing lobby by code</p>
                </a>
            </div>
            {user ? (
                <p>Logged in as {user.auth.email}</p>
            ) : (
                <p>Not logged in</p>
            )}
        </div>
    );
}
