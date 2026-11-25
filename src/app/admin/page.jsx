import Link from "next/link";
import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import AngkaHitung from "@/components/AngkaHitung";
import Badge from "@/components/Badge";

const STATISTIK = [
    { kunci: "total_judul", label: "Judul buku" },
    { kunci: "total_eksemplar", label: "Total eksemplar" },
    { kunci: "total_mahasiswa", label: "Mahasiswa terdaftar" },
    { kunci: "transaksi_aktif", label: "Transaksi aktif" },
    { kunci: "denda_lunas", label: "Denda lunas", rupiah: true },
];

const MENU = [
    {
        href: "/admin/users",
        judul: "Kelola Pengguna",
        ket: "Akun Admin, Pegawai, dan Mahasiswa",
    },
    {
        href: "/admin/kategori",
        judul: "Kelola Kategori",
        ket: "kelola data kategori buku",
    },
    {
        href: "/admin/transaksi",
        judul: "Monitoring Transaksi",
        ket: "Seluruh log peminjaman dan unduhan laporan",
    },
    {
        href: "/kelola/buku",
        judul: "Kelola Buku",
        ket: "Koleksi dan stok perpustakaan",
    },
    {
        href: "/kelola/pengumuman",
        judul: "Kelola Pengumuman",
        ket: "Berita, jadwal layanan, dan agenda",
    },
    {
        href: "/pegawai",
        judul: "Peminjaman & Pengembalian",
        ket: "Persetujuan pinjaman, pengembalian buku, dan denda",
    },
];

export default async function DashboardAdmin() {
    const sesi = await wajibPeran("Admin");

    const { rows } = await pool.query(`
        SELECT
            (SELECT COUNT(*) FROM buku) AS total_judul,
            (SELECT COALESCE(SUM(stok_total), 0) FROM buku) AS total_eksemplar,
            (SELECT COUNT(*) FROM pengguna WHERE peran = 'Mahasiswa') AS total_mahasiswa,
            (SELECT COUNT(*) FROM peminjaman WHERE status = 'Sedang Dipinjam') AS transaksi_aktif,
            (SELECT COALESCE(SUM(denda_total), 0) FROM peminjaman WHERE status_denda = 'Lunas') AS denda_lunas
    `);

    const statistik = rows[0];

    return (
        <>
            <section className="anim-naik relative overflow-hidden rounded-[28px] border-[2.5px] border-biru-tua bg-biru-tua text-white shadow-hero">
                <div
                    aria-hidden="true"
                    className="anim-melayang absolute -right-12 -top-12 size-52 rounded-full bg-kuning"
                />
                <div
                    aria-hidden="true"
                    style={{ animationDelay: "1.2s" }}
                    className="anim-melayang absolute right-40 top-28 size-16 rounded-full border-[6px] border-biru-muda/50"
                />
                <div
                    aria-hidden="true"
                    style={{ animationDelay: "2s" }}
                    className="anim-melayang absolute right-12 top-40 size-8 rotate-12 rounded-md bg-biru"
                />

                <div className="relative grid gap-3 p-[clamp(1.5rem,4vw,3rem)]">
                    <Badge>Admin</Badge>

                    <h1 className="text-[clamp(1.7rem,3.6vw,2.8rem)]">
                        Selamat datang,{" "}
                        <span className="text-kuning">{sesi.nama}</span>
                    </h1>

                    <p className="max-w-[50ch] text-biru-muda">
                        Ringkasan kondisi perpustakaan hari ini dan akses cepat
                        ke seluruh modul pengelolaan.
                    </p>
                </div>

                <dl className="relative grid grid-cols-2 border-t-[2.5px] border-white/20 md:grid-cols-3 lg:grid-cols-5">
                    {STATISTIK.map((s, i) => (
                        <div
                            key={s.kunci}
                            style={{ "--d": `${250 + i * 100}ms` }}
                            className="anim-naik border-b border-r border-white/15 px-6 py-5 last:border-r-0"
                        >
                            <dt className="text-sm text-biru-muda">
                                {s.label}
                            </dt>
                            <dd className="mt-1 font-judul text-[2rem] font-extrabold leading-none text-kuning">
                                <AngkaHitung
                                    nilai={Number(statistik[s.kunci])}
                                    rupiah={s.rupiah}
                                />
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section>
                <h2 className="anim-naik mb-4" style={{ "--d": "300ms" }}>
                    Menu Pengelolaan
                </h2>

                <ul className="border-t-[2.5px] border-biru-tua">
                    {MENU.map((m, i) => (
                        <li
                            key={m.href}
                            style={{ "--d": `${350 + i * 80}ms` }}
                            className="anim-naik border-b-[2.5px] border-biru-tua"
                        >
                            <Link
                                href={m.href}
                                className="group flex items-center gap-5 px-2 py-5 transition-all duration-300 hover:bg-kuning-muda hover:pl-6"
                            >
                                <span className="font-judul text-2xl font-extrabold text-biru/35 transition group-hover:text-biru">
                                    {String(i + 1).padStart(2, "0")}
                                </span>

                                <span className="flex-1">
                                    <strong className="block text-lg">
                                        {m.judul}
                                    </strong>
                                    <span className="text-sm opacity-75">
                                        {m.ket}
                                    </span>
                                </span>

                                <span className="text-2xl transition duration-300 group-hover:translate-x-2">
                                    →
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    );
}