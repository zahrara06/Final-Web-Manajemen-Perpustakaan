"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, children }) {
    const pathname = usePathname();
    const aktif =
        href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(href + "/");

    return (
        <Link
            href={href}
            className={`border-b-[3px] py-0.5 transition ${
                aktif ? "border-biru" : "border-transparent hover:border-kuning"
            }`}
        >
            {children}
        </Link>
    );
}