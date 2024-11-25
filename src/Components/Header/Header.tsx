import styles from "./Header.module.css";
import UserIcon from "../../assets/icons/UserIcon.tsx";
import SettingsIcon from "../../assets/icons/SettingsIcon.tsx";
import { useNavigate } from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();
    return (
        <div id={styles.container} className={"glassy"}>
            <p id={styles.title}>Songy</p>
            <div id={styles.iconContainer}>
                <SettingsIcon className={styles.icon} />
                <UserIcon
                    className={styles.icon}
                    onClick={() => {
                        navigate("/profile");
                    }}
                />
            </div>
        </div>
    );
}
