import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { rupiah } from "@/lib/util";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    await requireRole("admin");

    const { rows: [s] } = await pool.query(
        `SELECT
            (SELECT COUNT(*) FROM books)::int AS judul,
            (SELECT COALESCE(SUM(stok_total), 0) FROM books)::int AS eksemplar,
            (SELECT COUNT(*) FROM users WHERE role = 'mahasiswa')::int AS mahasiswa,
            (SELECT COUNT(*) FROM loans WHERE status = 'dipinjam')::int AS aktif,
            (SELECT COALESCE(SUM(denda_nominal), 0)
             FROM loans WHERE denda_status = 'lunas')::int AS denda_lunas`
    );

    const kartu = [
        ["Total Judul Buku", s.judul],
        ["Total Eksemplar Stok", s.eksemplar],
        ["Mahasiswa Terdaftar", s.mahasiswa],
        ["Transaksi Aktif", s.aktif],
        ["Denda Telah Lunas", rupiah(s.denda_lunas)],
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-purple-900">
                Dashboard Admin
            </h1>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {kartu.map(([t, v]) => (
                    <div key={t} className="card">
                        <p className="text-sm text-slate-500">{t}</p>
                        <p className="text-2xl font-bold text-purple-700">
                            {v}
                        </p>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-3">
                <Link href="/admin/users" className="btn">
                    Manajemen Pengguna
                </Link>

                <Link href="/admin/kategori" className="btn">
                    Manajemen Kategori
                </Link>

                <Link href="/admin/transaksi" className="btn">
                    Log Transaksi
                </Link>
            </div>
        </div>
    );
}
