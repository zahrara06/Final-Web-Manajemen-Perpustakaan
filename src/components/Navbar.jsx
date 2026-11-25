import Link from "next/link";
import { ambilSesi } from "@/lib/auth";
import { keluar } from "@/app/actions/auth";
import NavLink from "@/components/NavLink";
import pool from "@/lib/db";
import Avatar from "@/components/Avatar";

const MENU_UMUM = [
    { href: "/", nama: "Beranda" },
    { href: "/katalog", nama: "Katalog" },
    { href: "/pengumuman", nama: "Pengumuman" },
];

const MENU_PERAN = {
    Admin: [
        { href: "/admin", nama: "Dashboard Admin" },
        { href: "/kelola/buku", nama: "Kelola Buku" },
        { href: "/kelola/pengumuman", nama: "Kelola Pengumuman" },
    ],
    Pegawai: [
        { href: "/pegawai", nama: "Sirkulasi" },
        { href: "/kelola/buku", nama: "Kelola Buku" },
        { href: "/kelola/pengumuman", nama: "Kelola Pengumuman" },
    ],
    Mahasiswa: [
        { href: "/mahasiswa", nama: "Pinjaman Saya" },
    ],
};

export default async function Navbar() {
    const sesi = await ambilSesi();
    const menu = [...MENU_UMUM, ...(sesi ? MENU_PERAN[sesi.peran] : [])];
    const profil = sesi
    ? (
          await pool.query(
              "SELECT nama_lengkap, foto IS NOT NULL AS ada_foto FROM pengguna WHERE id = $1",
              [sesi.id]
          )
      ).rows[0]
    : null;

    return (
        <header className="sticky top-0 z-20 border-b-[2.5px] border-biru-tua bg-white">
            <div className="flex w-full flex-wrap items-center gap-6 px-[clamp(1rem,4vw,4.5rem)] py-3">
                <Link
                href="/"
                className="flex items-center gap-2.5 font-judul text-[1.35rem] font-extrabold"
                >
                    <span className="grid size-9 -rotate-6 place-items-center rounded-[10px] border-[2.5px] border-biru-tua bg-kuning shadow-[2px_2px_0_#0b1b4d]">
                        LS
                    </span>
                    LiteraSpace
                </Link>

                <nav className="flex flex-1 flex-wrap gap-5 text-[0.95rem] font-semibold">
                    {menu.map((m) => (
                        <NavLink key={m.href} href={m.href}>
                        {m.nama}
                        </NavLink>
                    ))}
                </nav>

                <div className="[&_form]:flex [&_form]:items-center [&_form]:gap-3">
                    {sesi ? (
                        <form action={keluar}>
                            <Link
                                href="/profil"
                                className="flex items-center gap-2 text-sm font-semibold hover:underline"
                            >
                                <Avatar
                                    id={sesi.id}
                                    nama={profil?.nama_lengkap ?? sesi.nama}
                                    adaFoto={profil?.ada_foto}
                                />
                                <span>
                                    {profil?.nama_lengkap ?? sesi.nama} ({sesi.peran})
                                </span>
                            </Link>
                            
                            <button className="inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-3 py-1 text-sm shadow-[2px_2px_0_#0b1b4d] bg-white">
                                Keluar
                            </button>
                        </form>
                    ) : (
                        <Link
                        href="/login"
                        className="inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-3 py-1 text-sm shadow-[2px_2px_0_#0b1b4d] bg-kuning"
                        >
                        Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}