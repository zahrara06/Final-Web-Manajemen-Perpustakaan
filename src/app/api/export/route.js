import pool from "@/lib/db";
import { getUser } from "@/lib/auth";

const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;

const SQL = {
    transaksi: `
        SELECT l.id, u.nama AS peminjam, u.nomor_identitas AS nim, b.judul, l.status,
               to_char(l.tanggal_pinjam,'YYYY-MM-DD') AS tanggal_pinjam,
               to_char(l.jatuh_tempo,'YYYY-MM-DD') AS jatuh_tempo,
               to_char(l.tanggal_kembali,'YYYY-MM-DD') AS tanggal_kembali,
               l.denda_nominal, l.denda_status
        FROM loans l
        JOIN users u ON u.id = l.user_id
        JOIN books b ON b.id = l.book_id
        ORDER BY l.id
    `,
    denda: `
        SELECT u.nama AS peminjam, u.nomor_identitas AS nim,
               COUNT(*)::int AS jumlah_denda,
               SUM(l.denda_nominal)::int AS total_denda,
               COALESCE(SUM(l.denda_nominal) FILTER (WHERE l.denda_status = 'lunas'), 0)::int AS sudah_lunas,
               COALESCE(SUM(l.denda_nominal) FILTER (WHERE l.denda_status = 'tertunggak'), 0)::int AS tertunggak
        FROM loans l
        JOIN users u ON u.id = l.user_id
        WHERE l.denda_status <> 'tidak_ada'
        GROUP BY u.id
        ORDER BY total_denda DESC
    `,
};

export async function GET(request) {
    const user = await getUser();

    if (!user || user.role !== "admin") {
        return new Response("Forbidden", { status: 403 });
    }

    const jenis =
        new URL(request.url).searchParams.get("jenis") === "denda"
            ? "denda"
            : "transaksi";

    const { rows } = await pool.query(SQL[jenis]);
    const kolom = rows.length ? Object.keys(rows[0]) : ["info"];

    const baris = rows.length
        ? rows.map((r) => kolom.map((k) => esc(r[k])).join(","))
        : [esc("Tidak ada data")];

    const csv = "\uFEFF" + [kolom.join(","), ...baris].join("\n");

    return new Response(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${jenis}-perpustakaan.csv"`,
        },
    });
}