import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Badge from "@/components/Badge";
import { rupiah, tgl } from "@/lib/util";

export const dynamic = "force-dynamic";

export default async function TransaksiPage() {
    await requireRole("admin");

    const log = (
        await pool.query(
            `SELECT l.id, u.nama, u.nomor_identitas, b.judul,
                    l.status, l.tanggal_pinjam, l.jatuh_tempo,
                    l.tanggal_kembali, l.denda_nominal, l.denda_status
             FROM loans l
             JOIN users u ON u.id = l.user_id
             JOIN books b ON b.id = l.book_id
             ORDER BY l.id DESC`
        )
    ).rows;

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold text-purple-900">
                    Log Seluruh Transaksi
                </h1>

                <div className="flex gap-2">
                    <a href="/api/export?jenis=transaksi" className="btn">
                        ⬇ CSV Transaksi
                    </a>

                    <a href="/api/export?jenis=denda" className="btn-sec">
                        ⬇ CSV Rekap Denda
                    </a>
                </div>
            </div>

            <div className="card overflow-x-auto">
                <table className="tbl">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Mahasiswa</th>
                            <th>Buku</th>
                            <th>Status</th>
                            <th>Pinjam</th>
                            <th>Jatuh Tempo</th>
                            <th>Kembali</th>
                            <th>Denda</th>
                        </tr>
                    </thead>

                    <tbody>
                        {log.map((l) => (
                            <tr key={l.id}>
                                <td>{l.id}</td>

                                <td>
                                    {l.nama}
                                    <br />
                                    <span className="text-xs text-slate-500">
                                        {l.nomor_identitas}
                                    </span>
                                </td>

                                <td>{l.judul}</td>

                                <td>
                                    <Badge s={l.status} />
                                </td>

                                <td>{tgl(l.tanggal_pinjam)}</td>
                                <td>{tgl(l.jatuh_tempo)}</td>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
