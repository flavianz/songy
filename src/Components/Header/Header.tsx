import styles from "./Header.module.css";
import UserIcon from "../../assets/icons/UserIcon.tsx";
import SettingsIcon from "../../assets/icons/SettingsIcon.tsx";

export default function Header() {
    return (
        <div id={styles.container}>
            <p id={styles.title}>Songy</p>
            <div>
                <SettingsIcon id={styles.settingsIcon} />
                <UserIcon id={styles.profileIcon} />
            </div>
        </div>
    );
}
