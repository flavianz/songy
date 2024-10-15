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

export const BASE_URL = "http://localhost:5137";

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
        element: <Profile />,
    },
    {
        path: "/signup",
        element: <Signup />,
    },
    {
        path: "/email_verified",
        element: <EmailVerified />,
    },
    {
        path: "/check_inbox",
        element: <CheckInbox />,
    },
    {
        path: "/lobby/join",
        element: <Join />,
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider loadingComponent={<p>loading</p>}>
            <RouterProvider router={browserRouter} />
        </AuthProvider>
    </StrictMode>,
);
