import Link from "next/link";
import { getUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import NavLink from "./NavLink";

export default async function Navbar() {
    const user = await getUser();

    const menu = [
        { href: "/", t: "Beranda", exact: true },
        { href: "/katalog", t: "Katalog" },
    ];

    if (!user || user.role === "mahasiswa") {
        menu.push({ href: "/pengumuman", t: "Pengumuman" });
    }

    if (user?.role === "mahasiswa") {
        menu.push({ href: "/mahasiswa", t: "Dashboard" });
    }

    if (user?.role === "pegawai") {
        menu.push(
            { href: "/pegawai", t: "Dashboard", exact: true },
            { href: "/kelola/buku", t: "Kelola Buku" },
            { href: "/kelola/pengumuman", t: "Kelola Pengumuman" }
        );
    }

    if (user?.role === "admin") {
        menu.push(
            { href: "/admin", t: "Dashboard", exact: true },
            { href: "/admin/users", t: "Pengguna" },
            { href: "/admin/kategori", t: "Kategori" },
            { href: "/admin/transaksi", t: "Transaksi" },
            { href: "/kelola/buku", t: "Buku" },
            { href: "/kelola/pengumuman", t: "Pengumuman" },
            { href: "/pegawai", t: "Sirkulasi" }
        );
    }

    return (
        <nav className="bg-purple-700 text-white sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                <Link href="/" className="text-lg font-bold">
                    📚 Perpustakaan UNHAS
                </Link>

                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm flex-1">
                    {menu.map((m) => (
                        <li key={m.href + m.t}>
                            <NavLink href={m.href} exact={m.exact}>
                                {m.t}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-3 text-sm">
                    {user ? (
                        <>
                            <span className="text-purple-100">
                                {user.nama} ({user.role})
                            </span>

                            <form action={logout}>
                                <button className="btn-sec">
                                    Keluar
                                </button>
                            </form>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="btn bg-white text-purple-700 hover:bg-purple-100"
                        >
                            Masuk
                        </Link>
                    )}
                </div>

            </div>
        </nav>
    );
}
