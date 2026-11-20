import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Badge from "@/components/Badge";
import Pesan from "@/components/Pesan";
import { ajukanPerpanjang, batalReservasi } from "@/app/actions/loans";
import { rupiah, tgl } from "@/lib/util";

export const dynamic = "force-dynamic";

export default async function MahasiswaPage({ searchParams }) {
    const user = await requireRole("mahasiswa");
    const sp = await searchParams;

    await pool.query(
        `INSERT INTO notifications (user_id, pesan)
         SELECT l.user_id,
                'Pengingat: "' || b.judul || '" jatuh tempo besok (' ||
                to_char(l.jatuh_tempo, 'DD-MM-YYYY') || ').'
         FROM loans l
         JOIN books b ON b.id = l.book_id
         WHERE l.user_id = $1
         AND l.status = 'dipinjam'
         AND l.jatuh_tempo = CURRENT_DATE + 1
         AND NOT EXISTS (
             SELECT 1 FROM notifications n
             WHERE n.user_id = l.user_id
             AND n.pesan = 'Pengingat: "' || b.judul || '" jatuh tempo besok (' ||
                           to_char(l.jatuh_tempo, 'DD-MM-YYYY') || ').'
         )`,
        [user.id]
    );

    const notifikasi = (
        await pool.query(
            `SELECT pesan, created_at
             FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC, id DESC
             LIMIT 8`,
            [user.id]
        )
    ).rows;

    const aktif = (
        await pool.query(
            `SELECT l.*, b.judul,
                CASE
                    WHEN l.status = 'dipinjam'
                    THEN GREATEST(CURRENT_DATE - l.jatuh_tempo, 0) * b.denda_per_hari
                    ELSE 0
                END AS denda_berjalan
             FROM loans l
             JOIN books b ON b.id = l.book_id
             WHERE l.user_id = $1
             AND l.status IN ('menunggu', 'dipinjam')
             ORDER BY l.created_at DESC`,
            [user.id]
        )
    ).rows;

    const reservasi = (
        await pool.query(
            `SELECT r.id, r.status, r.book_id, b.judul,
                (
                    SELECT COUNT(*)
                    FROM reservations r2
                    WHERE r2.book_id = r.book_id
                    AND r2.status = 'antre'
                    AND r2.created_at <= r.created_at
                )::int AS posisi
             FROM reservations r
             JOIN books b ON b.id = r.book_id
             WHERE r.user_id = $1
             AND r.status IN ('antre', 'diberitahu')
             ORDER BY r.created_at`,
            [user.id]
        )
    ).rows;

    const tunggakan = (
        await pool.query(
            `SELECT l.id, l.denda_nominal, b.judul
             FROM loans l
             JOIN books b ON b.id = l.book_id
             WHERE l.user_id = $1
             AND l.denda_status = 'tertunggak'`,
            [user.id]
        )
    ).rows;

    let totalTunggak = 0;

    for (const t of tunggakan) {
        totalTunggak += t.denda_nominal;
    }

    const riwayat = (
        await pool.query(
            `SELECT l.*, b.judul
             FROM loans l
             JOIN books b ON b.id = l.book_id
             WHERE l.user_id = $1
             AND l.status IN ('selesai', 'ditolak')
             ORDER BY l.created_at DESC`,
            [user.id]
        )
    ).rows;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-purple-900">
                Dashboard Mahasiswa
            </h1>

            <Pesan sp={sp} />

            {tunggakan.length > 0 && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <h2 className="font-bold text-red-700">
                        ⚠ Denda Tertunggak: {rupiah(totalTunggak)}
                    </h2>

                    <p className="text-sm text-red-600 mb-2">
                        Status blokir: pengajuan pinjam baru ditolak sampai denda
                        dilunasi di meja sirkulasi.
                    </p>

                    <ul className="text-sm list-disc ml-5 text-red-800">
                        {tunggakan.map((t) => (
                            <li key={t.id}>
                                {t.judul}: {rupiah(t.denda_nominal)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <section>
                <h2 className="text-lg font-bold text-purple-900 mb-2">
                    🔔 Notifikasi
                </h2>

                <div className="card">
                    <ul className="divide-y divide-purple-50 text-sm">
                        {notifikasi.map((n, i) => (
                            <li key={i} className="py-2 flex justify-between gap-3">
                                <span>{n.pesan}</span>
                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                    {tgl(n.created_at)}
                                </span>
                            </li>
                        ))}

                        {notifikasi.length === 0 && (
                            <li className="text-slate-500">
                                Belum ada notifikasi.
                            </li>
                        )}
                    </ul>
                </div>
            </section>

            <section>
                <h2 className="text-lg font-bold text-purple-900 mb-2">
                    Peminjaman Aktif
                </h2>

                <div className="card overflow-x-auto">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Buku</th>
                                <th>Status</th>
                                <th>Jatuh Tempo</th>
                                <th>Denda Berjalan</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {aktif.map((l) => (
                                <tr key={l.id}>
                                    <td>{l.judul}</td>
                                    <td><Badge s={l.status} /></td>
                                    <td>{tgl(l.jatuh_tempo)}</td>
                                    <td>
                                        {l.denda_berjalan > 0 ? (
                                            <span className="text-red-600">
                                                {rupiah(l.denda_berjalan)}
                                            </span>
                                        ) : "-"}
                                    </td>
                                    <td>
                                        {l.status === "dipinjam" &&
                                            l.perpanjangan_status === "tidak" && (
                                                <form action={ajukanPerpanjang}>
                                                    <input
                                                        type="hidden"
                                                        name="id"
                                                        value={l.id}
                                                    />
                                                    <button className="btn">
                                                        Ajukan Perpanjangan
                                                    </button>
                                                </form>
                                            )}

                                        {l.status === "dipinjam" &&
                                            l.perpanjangan_status !== "tidak" && (
                                                <Badge s={l.perpanjangan_status} />
                                            )}

                                        {l.status === "menunggu" && (
                                            <span className="text-xs text-slate-500">
                                                Temui pegawai di meja sirkulasi
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {aktif.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-slate-500">
                                        Tidak ada peminjaman aktif.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {reservasi.length > 0 && (
                <section>
                    <h2 className="text-lg font-bold text-purple-900 mb-2">
                        Reservasi Buku
                    </h2>

                    <div className="card overflow-x-auto">
                        <table className="tbl">
                            <thead>
                                <tr>
                                    <th>Buku</th>
                                    <th>Status</th>
                                    <th>Antrean ke-</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {reservasi.map((r) => (
                                    <tr key={r.id}>
                                        <td>
                                            <Link
                                                href={`/katalog/${r.book_id}`}
                                                className="text-purple-600 hover:underline"
                                            >
                                                {r.judul}
                                            </Link>
                                        </td>

                                        <td><Badge s={r.status} /></td>

                                        <td>
                                            {r.status === "antre" ? r.posisi : "-"}
                                        </td>

                                        <td>
                                            <form action={batalReservasi}>
                                                <input
                                                    type="hidden"
                                                    name="id"
                                                    value={r.id}
                                                />
                                                <button className="text-red-600 hover:underline text-sm">
                                                    Batalkan
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-lg font-bold text-purple-900 mb-2">
                    Riwayat Transaksi
                </h2>

                <div className="card overflow-x-auto">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Buku</th>
                                <th>Status</th>
                                <th>Dikembalikan</th>
                                <th>Denda</th>
                                <th>Ulasan</th>
                            </tr>
                        </thead>

                        <tbody>
                            {riwayat.map((l) => (
                                <tr key={l.id}>
                                    <td>{l.judul}</td>

                                    <td>
                                        <Badge s={l.status} />
                                        {l.alasan_tolak && (
                                            <p className="text-xs text-red-600 mt-1">
                                                {l.alasan_tolak}
                                            </p>
                                        )}
                                    </td>

                                    <td>{tgl(l.tanggal_kembali)}</td>

                                    <td>
                                        {l.denda_status === "tidak_ada" ? (
                                            "-"
                                        ) : (
                                            <>
                                                {rupiah(l.denda_nominal)}{" "}
                                                <Badge s={l.denda_status} />
                                            </>
                                        )}
                                    </td>

                                    <td>
                                        {l.status === "selesai" && (
                                            <Link
                                                href={`/katalog/${l.book_id}#ulasan`}
                                                className="text-purple-600 hover:underline"
                                            >
                                                Tulis ulasan
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {riwayat.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-slate-500">
                                        Belum ada riwayat.
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
