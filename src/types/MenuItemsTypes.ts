import type { IconType } from "react-icons";

export interface MenuItems {
    label: string;
    href?: string;
    icon?: string | IconType;
    subItems?: MenuItems[];
}