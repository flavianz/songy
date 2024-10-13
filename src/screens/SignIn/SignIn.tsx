import { FormEvent, useState } from "react";
import {
    firebaseSignInWithEmailAndPassword,
    signInWithGoogle,
} from "../../firebase/auth.ts";
import { getUser } from "../../context/AuthContext.tsx";
import { Navigate } from "react-router-dom";

export default function SignIn() {
    if (getUser()) {
        return <Navigate to="/profile" />;
    }
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        firebaseSignInWithEmailAndPassword(email, password).then((e) =>
            console.log(e),
        );
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name={"email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    name={"password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            <button
                onClick={() => signInWithGoogle().then((e) => console.log(e))}
            >
                Google
            </button>
        </div>
    );
}
