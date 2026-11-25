import Link from "next/link";
import pool from "@/lib/db";
import Badge from "@/components/Badge";
import { wajibPeran } from "@/lib/auth";
import { rupiah, formatTanggal } from "@/lib/util";

const BATAS_PER_HALAMAN = 50;

export default async function MonitoringTransaksi({ searchParams }) {
    await wajibPeran("Admin");
    const sp = await searchParams;

    const { rows: jumlahRows } = await pool.query(
        "SELECT COUNT(*) AS total FROM peminjaman"
    );
    const totalTransaksi = Number(jumlahRows[0].total);
    const jumlahHalaman = Math.max(
        1,
        Math.ceil(totalTransaksi / BATAS_PER_HALAMAN)
    );
    const parameterHalaman = Array.isArray(sp?.halaman)
        ? sp.halaman[0]
        : sp?.halaman;
    const halamanDiminta = Number.parseInt(parameterHalaman ?? "1", 10);
    const halaman =
        Number.isInteger(halamanDiminta) && halamanDiminta > 0
            ? Math.min(halamanDiminta, jumlahHalaman)
            : 1;

    const { rows: transaksi } = await pool.query(
        `SELECT p.id, p.status, p.tanggal_pinjam, p.jatuh_tempo, p.tanggal_kembali,
                p.status_perpanjangan, p.status_denda,
                CASE WHEN p.status = 'Sedang Dipinjam'
                     THEN GREATEST(0, CURRENT_DATE - p.jatuh_tempo) * b.denda_per_hari
                     ELSE p.denda_total END AS denda_saat_ini,
                u.nama_lengkap, b.judul
         FROM peminjaman p
         JOIN pengguna u ON u.id = p.pengguna_id
         JOIN buku b ON b.id = p.buku_id
         ORDER BY p.id DESC
         LIMIT $1 OFFSET $2`,
        [BATAS_PER_HALAMAN, (halaman - 1) * BATAS_PER_HALAMAN]
    );
    const awal = totalTransaksi === 0 ? 0 : (halaman - 1) * BATAS_PER_HALAMAN + 1;
    const akhir = Math.min(halaman * BATAS_PER_HALAMAN, totalTransaksi);

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h1>Monitoring Transaksi</h1>

                <div className="flex flex-wrap gap-2">
                    <a
                        href="/api/export?jenis=transaksi"
                        className="rounded-xl border-2 border-biru-tua bg-kuning px-3 py-2 text-sm font-bold text-biru-tua shadow-keras hover:translate-x-0.5 hover:translate-y-0.5"
                    >
                        Unduh transaksi (CSV)
                    </a>

                    <a
                        href="/api/export?jenis=denda"
                        className="rounded-xl border-2 border-biru-tua bg-white px-3 py-2 text-sm font-bold text-biru-tua shadow-keras hover:translate-x-0.5 hover:translate-y-0.5"
                    >
                        Unduh rekap denda (CSV)
                    </a>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full overflow-hidden rounded-xl border-2 border-biru-tua bg-white shadow-keras">
                    <thead className="bg-biru-tua text-white">
                        <tr>
                            <th className="p-3 text-left text-sm">#</th>
                            <th className="p-3 text-left text-sm">Mahasiswa</th>
                            <th className="p-3 text-left text-sm">Buku</th>
                            <th className="p-3 text-left text-sm">Status</th>
                            <th className="p-3 text-left text-sm">Pinjam</th>
                            <th className="p-3 text-left text-sm">Jatuh tempo</th>
                            <th className="p-3 text-left text-sm">Kembali</th>
                            <th className="p-3 text-left text-sm">Perpanjangan</th>
                            <th className="p-3 text-left text-sm">Denda</th>
                        </tr>
                    </thead>

                    <tbody>
                        {transaksi.map((item) => (
                            <tr key={item.id} className="border-t border-biru-muda">
                                <td className="p-3">{item.id}</td>
                                <td className="p-3">{item.nama_lengkap}</td>
                                <td className="p-3">{item.judul}</td>
                                <td className="p-3">
                                    <Badge>{item.status}</Badge>
                                </td>
                                <td className="p-3">{formatTanggal(item.tanggal_pinjam)}</td>
                                <td className="p-3">{formatTanggal(item.jatuh_tempo)}</td>
                                <td className="p-3">{formatTanggal(item.tanggal_kembali)}</td>
                                <td className="p-3">{item.status_perpanjangan}</td>
                                <td className="p-3">
                                    {item.denda_saat_ini > 0
                                        ? `${rupiah(item.denda_saat_ini)} (${item.status_denda === "Tidak Ada" ? "berjalan" : item.status_denda})`
                                        : "-"}
                                </td>
                            </tr>
                        ))}

                        {transaksi.length === 0 && (
                            <tr>
                                <td colSpan={9} className="p-5 text-center opacity-70">
                                    Belum ada riwayat transaksi.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                {jumlahHalaman > 1 && (
                    <nav
                        aria-label="Navigasi riwayat transaksi"
                        className="flex items-center gap-3"
                    >
                        {halaman > 1 && (
                            <Link
                                href={`/admin/transaksi?halaman=${halaman - 1}`}
                                className="font-bold text-biru underline"
                            >
                                Sebelumnya
                            </Link>
                        )}
                        <span className="text-sm">
                            Halaman {halaman} dari {jumlahHalaman}
                        </span>
                        {halaman < jumlahHalaman && (
                            <Link
                                href={`/admin/transaksi?halaman=${halaman + 1}`}
                                className="font-bold text-biru underline"
                            >
                                Berikutnya
                            </Link>
                        )}
                    </nav>
                )}
            </div>
        </>
    );
}
