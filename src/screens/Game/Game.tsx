import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { Game } from "../../firebase/types.ts";
import { firestore } from "../../firebase/firebase.ts";
import { ensureSignOut } from "../../firebase/auth.ts";
import { getUser } from "../../context/AuthContext.tsx";

export default function Game() {
    ensureSignOut();
    let user = getUser()!;
    const { uuid } = useParams();
    const navigate = useNavigate();

    if (typeof uuid !== "string") {
        return <div>no uuid</div>;
    }

    const [lyrics, setLyrics] = useState<string | null>(null);
    const [start, setStart] = useState<number | null>(null);
    const [end, setEnd] = useState<number | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState("");

    useEffect(() => {
        console.log("subscribed game");
        const unsubGame = onSnapshot(
            doc(firestore, "/games/" + uuid),
            (doc) => {
                console.log("refetched game");
                if (!doc.exists()) {
                    unsubGame();
                    setError("Lobby does not exist");
                    return;
                }
                let data = doc.data() as Game;
                setGame(data);
                if (!Object.keys(data.players).includes(user.auth.uid)) {
                    unsubGame();
                    setError("Not in game");
                }
            },
        );
    }, []);

    return <div></div>;
}
