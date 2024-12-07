import { useEffect, useState } from "react";
import { doc, getDoc, writeBatch } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase.ts";
import { useNavigate } from "react-router-dom";
import { getRandomHex } from "../../../firebase/functions/utils.ts";
import { getUser } from "../../../context/AuthContext.tsx";
import styles from "./Join.module.css";
import Header from "../../../Components/Header/Header.tsx";
import { FirestoreLobby } from "../../../types/types.ts";

export default function Join() {
    const user = getUser()!;

    const navigate = useNavigate();

    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(lobbyCode: string) {
        let lobby = await getDoc(doc(firestore, "lobbies", lobbyCode));
        if (!lobby.exists()) {
            setError("Unknown lobby code");
            return;
        }
        if (
            Object.keys((lobby.data() as FirestoreLobby).players).includes(
                user.auth.uid,
            )
        ) {
            navigate("/lobby/" + lobbyCode);
            return;
        }
        const batch = writeBatch(firestore);
        batch.update(doc(firestore, "lobbies", lobbyCode), {
            ["players." + user.auth.uid]: {
                color: getRandomHex(),
                username: user.username,
            },
        });
        batch.update(doc(firestore, "users", user.auth.uid), {
            lobby: lobbyCode,
        });
        await batch.commit();
        navigate("/lobby/" + lobbyCode);
    }

    useEffect(() => {
        if (user.lobby !== "") {
            handleSubmit(user.lobby);
        }
    });

    return (
        <div id={styles.container}>
            <Header />
            <form
                id={styles.form}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(code);
                }}
            >
                <h1 id={styles.title}>Enter pin</h1>
                <input
                    id={styles.input}
                    className={"glassy"}
                    type="text"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                    }}
                />
                <button className={"glassy"} id={styles.button} type="submit">
                    Join Game
                </button>
                <p>{error}</p>
            </form>
        </div>
    );
}
