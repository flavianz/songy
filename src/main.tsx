import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./screens/Home/Home.tsx";
import SignIn from "./screens/SignIn/SignIn.tsx";
import { AuthProvider } from "./provider/AuthProvider.tsx";
import Profile from "./screens/Profile/Profile.tsx";
import Signup from "./screens/Signup/Signup.tsx";
import EmailVerified from "./screens/EmailVerified/EmailVerified.tsx";
import CheckInbox from "./screens/CheckInbox/CheckInbox.tsx";
import Join from "./screens/Lobby/Join/Join.tsx";
import Lobby from "./screens/Lobby/Lobby/Lobby.tsx";
import Create from "./screens/Lobby/Create/Create.tsx";
import GameScreen from "./screens/Game/GameScreen.tsx";
import EnsureSignIn from "./provider/EnsureSignIn.tsx";

export const BASE_URL = "http://localhost:5173/";

const browserRouter = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/signin",
        element: <SignIn />,
    },
    {
        path: "/profile",
        element: (
            <EnsureSignIn>
                <Profile />
            </EnsureSignIn>
        ),
    },
    {
        path: "/signup",
        element: <Signup />,
    },
    {
        path: "/email_verified",
        element: (
            <EnsureSignIn>
                <EmailVerified />
            </EnsureSignIn>
        ),
    },
    {
        path: "/check_inbox",
        element: (
            <EnsureSignIn allowEmailUnverified>
                <CheckInbox />
            </EnsureSignIn>
        ),
    },
    {
        path: "/join",
        element: (
            <EnsureSignIn>
                <Join />
            </EnsureSignIn>
        ),
    },
    {
        path: "/lobby/:lobbyCode",
        element: (
            <EnsureSignIn>
                <Lobby />
            </EnsureSignIn>
        ),
    },
    {
        path: "/create",
        element: (
            <EnsureSignIn>
                <Create />
            </EnsureSignIn>
        ),
    },
    {
        path: "/game/:uuid",
        element: (
            <EnsureSignIn>
                <GameScreen />
            </EnsureSignIn>
        ),
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider loadingComponent={<p>loading</p>}>
            <RouterProvider router={browserRouter} />
        </AuthProvider>
    </StrictMode>,
);

export const DEBUG = import.meta.env.VITE_DEBUG == "true";
export function debug(message?: any) {
    if (DEBUG) {
        console.log("[DEBUG]", message);
    }
}
