import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { tgl } from "@/lib/util";

export const dynamic = "force-dynamic";

export default async function DetailPengumumanPage({ params }) {
    const { id } = await params;

    if (!Number.isInteger(Number(id))) {
        notFound();
    }

    const { rows: [a] } = await pool.query(
        `SELECT * FROM announcements
         WHERE id = $1 AND status = 'Published'`,
        [id]
    );

    if (!a) {
        notFound();
    }

    return (
        <article className="max-w-2xl mx-auto card p-6">
            <span className="text-xs text-purple-600 font-medium">
                {a.kategori} • {tgl(a.tanggal_rilis)}
            </span>

            <h1 className="text-2xl font-bold text-purple-900 mt-1 mb-4">
                {a.judul}
            </h1>

            <p className="whitespace-pre-line leading-relaxed text-slate-700">
                {a.konten}
            </p>

            <Link href="/pengumuman" className="btn-sec mt-6">
                ← Kembali
            </Link>
        </article>
    );
}
