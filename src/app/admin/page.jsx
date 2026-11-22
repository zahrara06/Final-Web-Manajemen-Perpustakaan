import Link from "next/link";
import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { rupiah } from "@/lib/util";

export default async function DashboardAdmin() {
    await wajibPeran("Admin");

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
            <h1>Dashboard Admin</h1>

            <section className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-5 [&>div:nth-child(odd)]:bg-kuning [&_strong]:block [&_strong]:font-judul [&_strong]:text-[2.2rem]">
                <div className="block rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 shadow-keras">
                    <strong>{statistik.total_judul}</strong>
                    Judul buku
                </div>

                <div className="block rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 shadow-keras">
                    <strong>{statistik.total_eksemplar}</strong>
                    Total eksemplar
                </div>

                <div className="block rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 shadow-keras">
                    <strong>{statistik.total_mahasiswa}</strong>
                    Mahasiswa terdaftar
                </div>

                <div className="block rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 shadow-keras">
                    <strong>{statistik.transaksi_aktif}</strong>
                    Transaksi aktif
                </div>

                <div className="block rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 shadow-keras">
                    <strong>{rupiah(statistik.denda_lunas)}</strong>
                    Denda lunas
                </div>
            </section>

            <section className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">
                <Link
                    href="/admin/users"
                    className="block rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 font-bold shadow-keras"
                >
                    Kelola Pengguna
                    <span className="mt-0.5 block text-sm font-normal opacity-75">
                        Akun Admin, Pegawai, dan Mahasiswa
                    </span>
                </Link>

                <Link
                    href="/admin/kategori"
                    className="block rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 font-bold shadow-keras"
                >
                    Kelola Kategori
                    <span className="mt-0.5 block text-sm font-normal opacity-75">
                        Master data kategori buku
                    </span>
                </Link>

                <Link
                    href="/admin/transaksi"
                    className="block rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 font-bold shadow-keras"
                >
                    Monitoring Transaksi
                    <span className="mt-0.5 block text-sm font-normal opacity-75">
                        Seluruh log peminjaman
                    </span>
                </Link>

                <Link
                    href="/kelola/buku"
                    className="block rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 font-bold shadow-keras"
                >
                    Kelola Buku
                    <span className="mt-0.5 block text-sm font-normal opacity-75">
                        Koleksi dan stok
                    </span>
                </Link>

                <Link
                    href="/kelola/pengumuman"
                    className="block rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 font-bold shadow-keras"
                >
                    Kelola Pengumuman
                    <span className="mt-0.5 block text-sm font-normal opacity-75">
                        Berita dan agenda
                    </span>
                </Link>

                <Link
                    href="/pegawai"
                    className="block rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 font-bold shadow-keras"
                >
                    Peminjaman & Pengembalian
                    <span className="mt-0.5 block text-sm font-normal opacity-75">
                        Persetujuan pinjaman, pengembalian buku, dan pengelolaan denda
                    </span>
                </Link>
            </section>
        </>
    );
}