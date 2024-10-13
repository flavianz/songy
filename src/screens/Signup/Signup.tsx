import { FormEvent, useState } from "react";
import { firebaseCreateUserWithEmailAndPassword } from "../../firebase/auth.ts";
import { getUser } from "../../context/AuthContext.tsx";
import { Navigate } from "react-router-dom";

export default function Signup() {
    if (getUser()) {
        return <Navigate to={"/profile"} />;
    }
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        setLoading(true);
        setError("");
        e.preventDefault();

        if (confirmPassword.toString() != password.toString()) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        try {
            await firebaseCreateUserWithEmailAndPassword(email, password);
        } catch (error) {
            setError((error as Error).message);
        }
        setLoading(false);
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="submit">Sign Up</button>
            </form>
            <p>{error}</p>
            {loading && <p>loading</p>}
        </div>
    );
}
