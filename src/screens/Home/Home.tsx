import styles from "./Home.module.css";
import { Link } from "react-router-dom";
import Header from "../../Components/Header/Header.tsx";

export default function Home() {
    return (
        <div id={styles.container}>
            <Header />
            <div id={styles.playWrapper}>
                <div id={styles.playContainer} className={"glassy"}>
                    <h1>Wanna play a game?</h1>
                    <div id={styles.buttonContainer}>
                        <Link
                            to="/create"
                            className={styles.button + " glassy"}
                        >
                            <h3>Create a lobby</h3>
                        </Link>
                        <Link to="/join" className={styles.button + " glassy"}>
                            <h3>Join a lobby</h3>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
