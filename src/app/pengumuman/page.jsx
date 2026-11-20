import Link from "next/link";
import pool from "@/lib/db";
import { tgl } from "@/lib/util";

export const dynamic = "force-dynamic";

export default async function DaftarPengumumanPage() {
    const pengumuman = (
        await pool.query(
            `SELECT
                id,
                judul,
                kategori,
                tanggal_rilis,
                LEFT(konten, 160) AS ringkas
             FROM announcements
             WHERE status = 'Published'
             ORDER BY tanggal_rilis DESC, id DESC`
        )
    ).rows;

    return (
        <div>
            <h1 className="text-2xl font-bold text-purple-900 mb-4">
                Pengumuman Perpustakaan
            </h1>

            <div className="grid md:grid-cols-2 gap-4">
                {pengumuman.map((p) => (
                    <Link
                        key={p.id}
                        href={`/pengumuman/${p.id}`}
                        className="card hover:border-purple-300 hover:shadow-md transition"
                    >
                        <span className="text-xs text-purple-600 font-medium">
                            {p.kategori} • {tgl(p.tanggal_rilis)}
                        </span>

                        <h2 className="font-semibold mt-1">
                            {p.judul}
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            {p.ringkas}...
                        </p>
                    </Link>
                ))}
            </div>

            {pengumuman.length === 0 && (
                <p className="text-slate-500">
                    Belum ada pengumuman.
            </p>
            )}
        </div>
    );
}
