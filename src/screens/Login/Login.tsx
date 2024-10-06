import { FormEvent, useState } from "react";
import {
    firebaseLoginWithEmailAndPassword,
    signInWithGoogle,
} from "../../firebase/auth.ts";
import { getUser } from "../../context/AuthContext.tsx";
import { Navigate } from "react-router-dom";

export default function Login() {
    if (getUser()) {
        return <Navigate to="/profile" />;
    }
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        firebaseLoginWithEmailAndPassword(email, password).then((e) =>
            alert(e),
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
            <button onClick={() => signInWithGoogle()}>Google</button>
        </div>
    );
}
