import styles from "./Header.module.css";
import UserIcon from "../../assets/icons/UserIcon.tsx";
import SettingsIcon from "../../assets/icons/SettingsIcon.tsx";
import { Link } from "react-router-dom";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/Components/ui/navigation-menu.tsx";
import { Separator } from "@/Components/ui/separator.tsx";

export default function Header() {
    return (
        <>
            <div id={styles.container}>
                <p id={styles.title}>Songy</p>
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <Link to={"/profile"}>
                                <NavigationMenuLink
                                    className={navigationMenuTriggerStyle()}
                                >
                                    <UserIcon />
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link to={"/settings"}>
                                <NavigationMenuLink
                                    className={navigationMenuTriggerStyle()}
                                >
                                    <SettingsIcon />
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
            <Separator />
        </>
    );
}
