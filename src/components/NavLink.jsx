"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, exact = false, children }) {
    const pathname = usePathname();

    const aktif = exact
        ? pathname === href
        : pathname.startsWith(href);

    return (
        <Link
            href={href}
            className={
                aktif
                    ? "text-white font-semibold border-b-2 border-white pb-1"
                    : "text-purple-100 hover:text-white transition"
            }
        >
            {children}
        </Link>
    );
}
