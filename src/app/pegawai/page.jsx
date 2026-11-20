
import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Pesan from "@/components/Pesan";
import {
    putusPinjam,
    kembalikanBuku,
    lunasiDenda,
    putusPerpanjang
} from "@/app/actions/loans";
import { rupiah, tgl } from "@/lib/util";

export const dynamic = "force-dynamic";

export default async function PegawaiPage({ searchParams }) {
    await requireRole("pegawai", "admin");

    const sp = await searchParams;
    const q = (sp.q || "").trim();

    const antrean = (
        await pool.query(
            `SELECT l.id, u.nama, u.nomor_identitas, b.judul, b.stok_tersedia
             FROM loans l
             JOIN users u ON u.id = l.user_id
             JOIN books b ON b.id = l.book_id
             WHERE l.status = 'menunggu'
             ORDER BY l.created_at`
        )
    ).rows;

    const perpanjangan = (
        await pool.query(
            `SELECT l.id, u.nama, b.judul, l.jatuh_tempo
             FROM loans l
             JOIN users u ON u.id = l.user_id
             JOIN books b ON b.id = l.book_id
             WHERE l.perpanjangan_status = 'diajukan'
             ORDER BY l.id`
        )
    ).rows;

    const pengembalian = (
        await pool.query(
            `SELECT l.id, u.nama, u.nomor_identitas, b.judul,
                    l.jatuh_tempo,
                    GREATEST(CURRENT_DATE - l.jatuh_tempo, 0) * b.denda_per_hari AS denda_berjalan
             FROM loans l
             JOIN users u ON u.id = l.user_id
             JOIN books b ON b.id = l.book_id
             WHERE l.status = 'dipinjam'
             AND (
                 $1 = ''
                 OR u.nama ILIKE '%' || $1 || '%'
                 OR u.nomor_identitas ILIKE '%' || $1 || '%'
                 OR b.judul ILIKE '%' || $1 || '%'
             )
             ORDER BY l.jatuh_tempo`,
            [q]
        )
    ).rows;

    const tunggakan = (
        await pool.query(
            `SELECT l.id, u.nama, u.nomor_identitas,
                    b.judul, l.denda_nominal
             FROM loans l
             JOIN users u ON u.id = l.user_id
             JOIN books b ON b.id = l.book_id
             WHERE l.denda_status = 'tertunggak'
             ORDER BY l.id`
        )
    ).rows;

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3 justify-between">
                <h1 className="text-2xl font-bold text-purple-900">
                    Dashboard Pegawai
                </h1>

                <div className="flex gap-2">
                    <Link href="/kelola/buku" className="btn-sec">
                        Kelola Buku
                    </Link>

                    <Link href="/kelola/pengumuman" className="btn-sec">
                        Kelola Pengumuman
                    </Link>
                </div>
            </div>

            <Pesan sp={sp} />

            <section>
                <h2 className="text-lg font-bold text-purple-900 mb-2">
                    Antrean Verifikasi Peminjaman
                </h2>

                <div className="card overflow-x-auto">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Mahasiswa</th>
                                <th>Buku</th>
                                <th>Stok</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {antrean.map((l) => (
                                <tr key={l.id}>
                                    <td>
                                        {l.nama}
                                        <br />
                                        <span className="text-xs text-slate-500">
                                            {l.nomor_identitas}
                                        </span>
                                    </td>

                                    <td>{l.judul}</td>
                                    <td>{l.stok_tersedia}</td>

                                    <td>
                                        <form
                                            action={putusPinjam}
                                            className="flex flex-wrap gap-2 items-center"
                                        >
                                            <input
                                                type="hidden"
                                                name="id"
                                                value={l.id}
                                            />

                                            <input
                                                name="alasan"
                                                placeholder="Alasan jika ditolak"
                                                className="inp sm:w-44"
                                            />

                                            <button
                                                name="aksi"
                                                value="setuju"
                                                className="btn"
                                            >
                                                Setujui
                                            </button>

                                            <button
                                                name="aksi"
                                                value="tolak"
                                                className="btn-red"
                                            >
                                                Tolak
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}

                            {antrean.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-slate-500">
                                        Tidak ada antrean.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="text-lg font-bold text-purple-900 mb-2">
                    Pengajuan Perpanjangan
                </h2>

                <div className="card overflow-x-auto">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Mahasiswa</th>
                                <th>Buku</th>
                                <th>Jatuh Tempo</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {perpanjangan.map((l) => (
                                <tr key={l.id}>
                                    <td>{l.nama}</td>
                                    <td>{l.judul}</td>
                                    <td>{tgl(l.jatuh_tempo)}</td>

                                    <td>
                                        <form
                                            action={putusPerpanjang}
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="hidden"
                                                name="id"
                                                value={l.id}
                                            />

                                            <button
                                                name="aksi"
                                                value="setuju"
                                                className="btn"
                                            >
                                                Setujui
                                            </button>

                                            <button
                                                name="aksi"
                                                value="tolak"
                                                className="btn-red"
                                            >
                                                Tolak
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}

                            {perpanjangan.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-slate-500">
                                        Tidak ada pengajuan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="text-lg font-bold text-purple-900 mb-2">
                    Pengembalian Buku
                </h2>

                <form className="flex gap-2 mb-3">
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Cari nama / NIM / judul buku"
                        className="inp"
                    />

                    <button className="btn">
                        Cari
                    </button>
                </form>

                <div className="card overflow-x-auto">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Mahasiswa</th>
                                <th>Buku</th>
                                <th>Jatuh Tempo</th>
                                <th>Denda Saat Ini</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pengembalian.map((l) => (
                                <tr key={l.id}>
                                    <td>
                                        {l.nama}
                                        <br />
                                        <span className="text-xs text-slate-500">
                                            {l.nomor_identitas}
                                        </span>
                                    </td>

                                    <td>{l.judul}</td>
                                    <td>{tgl(l.jatuh_tempo)}</td>

                                    <td>
                                        {l.denda_berjalan > 0 ? (
                                            <span className="text-red-600">
                                                {rupiah(l.denda_berjalan)}
                                            </span>
                                        ) : "-"}
                                    </td>

                                    <td>
                                        <form action={kembalikanBuku}>
                                            <input
                                                type="hidden"
                                                name="id"
                                                value={l.id}
                                            />

                                            <button className="btn">
                                                Konfirmasi Kembali
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}

                            {pengembalian.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-slate-500">
                                        Tidak ada transaksi aktif.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="text-lg font-bold text-purple-900 mb-2">
                    Denda Tertunggak
                </h2>

                <div className="card overflow-x-auto">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Mahasiswa</th>
                                <th>Buku</th>
                                <th>Nominal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {tunggakan.map((l) => (
                                <tr key={l.id}>
                                    <td>
                                        {l.nama}
                                        <br />
                                        <span className="text-xs text-slate-500">
                                            {l.nomor_identitas}
                                        </span>
                                    </td>

                                    <td>{l.judul}</td>
                                    <td>{rupiah(l.denda_nominal)}</td>

                                    <td>
                                        <form action={lunasiDenda}>
                                            <input
                                                type="hidden"
                                                name="id"
                                                value={l.id}
                                            />

                                            <button className="btn">
                                                Tandai Lunas
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}

                            {tunggakan.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-slate-500">
                                        Tidak ada denda tertunggak.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

        </div>
    );
}
