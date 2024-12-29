import styles from "./SignIn.module.css";
import { FormEvent, useState } from "react";
import {
    firebaseSignInWithEmailAndPassword,
    signInWithGoogle,
} from "@/firebase/auth.ts";
import { Navigate, useNavigate } from "react-router-dom";
import { getUser } from "../../context/AuthContext.tsx";
import { LoginForm } from "@/Components/login-form.tsx";
import Header from "@/Components/Header/Header.tsx";

export default function SignIn() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const user = getUser();
    if (user) {
        return <Navigate to="/profile" />;
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        firebaseSignInWithEmailAndPassword(email, password).then((e) =>
            console.log(e),
        );
    }

    return (
        <div id={styles.container}>
            <Header />
            <div id={styles.formContainer}>
                <LoginForm />
            </div>
        </div>
    );

    // return (
    //     <div>
    //         <form onSubmit={handleSubmit}>
    //             <input
    //                 type="text"
    //                 name={"email"}
    //                 value={email}
    //                 onChange={(e) => setEmail(e.target.value)}
    //             />
    //             <input
    //                 type="password"
    //                 name={"password"}
    //                 value={password}
    //                 onChange={(e) => setPassword(e.target.value)}
    //             />
    //             <button type="submit">Login</button>
    //         </form>
    //         <button
    //             onClick={() =>
    //                 signInWithGoogle().then((e) => {
    //                     if (e.operationType == "link") {
    //                         navigate("/email_verified");
    //                     }
    //                 })
    //             }
    //         >
    //             Google
    //         </button>
    //     </div>
    // );
}
