import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ambilSesi } from "@/lib/auth";

const KUERI = {
    transaksi: {
        judul: [
        "ID",
        "Mahasiswa",
        "NIM",
        "Buku",
        "Status",
        "Tanggal pinjam",
        "Jatuh tempo",
        "Tanggal kembali",
        "Perpanjangan",
        "Denda",
        "Status denda",
        ],
        sql: `SELECT p.id,
                    u.nama_lengkap,
                    u.nomor_identitas,
                    b.judul,
                    p.status,
                    p.tanggal_pinjam,
                    p.jatuh_tempo,
                    p.tanggal_kembali,
                    p.status_perpanjangan,
                    CASE
                    WHEN p.status = 'Sedang Dipinjam'
                    THEN GREATEST(0, CURRENT_DATE - p.jatuh_tempo) * b.denda_per_hari
                    ELSE p.denda_total
                    END AS denda,
                    p.status_denda
            FROM peminjaman p
            JOIN pengguna u ON u.id = p.pengguna_id
            JOIN buku b ON b.id = p.buku_id
            ORDER BY p.id`,
    },
    denda: {
        judul: [
        "Mahasiswa",
        "NIM",
        "Jumlah transaksi berdenda",
        "Total denda",
        "Tertunggak",
        "Lunas",
        ],
        sql: `SELECT u.nama_lengkap,
                    u.nomor_identitas,
                    COUNT(*) AS jumlah,
                    SUM(p.denda_total) AS total,
                    COALESCE(SUM(p.denda_total) FILTER (WHERE p.status_denda = 'Tertunggak'), 0) AS tertunggak,
                    COALESCE(SUM(p.denda_total) FILTER (WHERE p.status_denda = 'Lunas'), 0) AS lunas
            FROM peminjaman p
            JOIN pengguna u ON u.id = p.pengguna_id
            WHERE p.denda_total > 0
            GROUP BY u.id
            ORDER BY total DESC`,
    },
};

const sel = (nilai) => `"${String(nilai ?? "").replace(/"/g, '""')}"`;

export async function GET(request) {
    const sesi = await ambilSesi();
    if (sesi?.peran !== "Admin") {
        return new NextResponse("Tidak diizinkan.", { status: 403 });
    }

    const jenis = request.nextUrl.searchParams.get("jenis") === "denda" ? "denda" : "transaksi";
    const { rows } = await pool.query(KUERI[jenis].sql);

    const baris = [KUERI[jenis].judul, ...rows.map((r) => Object.values(r))];
    const csv = "\uFEFF" + baris.map((b) => b.map(sel).join(",")).join("\r\n");

    return new NextResponse(csv, {
        headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${jenis}-literaspace.csv"`,
        },
    });
}