import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { formatTanggal } from "@/lib/util";
import Badge from "@/components/Badge";

export default async function DetailPengumuman({ params }) {
    const { id } = await params;

    if (!/^\d+$/.test(id)) notFound();

    const { rows } = await pool.query(
        "SELECT * FROM pengumuman WHERE id = $1 AND status = 'Published'",
        [id]
    );

    const pengumuman = rows[0];

    if (!pengumuman) notFound();

    return (
        <article className="block max-w-[760px] rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 shadow-keras">
        <Badge>{pengumuman.kategori}</Badge>

        <h1 className="mt-3 mb-1.5">{pengumuman.judul}</h1>
        <small>Dirilis {formatTanggal(pengumuman.tanggal_rilis)}</small>

        <p className="mt-5 mb-6 whitespace-pre-line">{pengumuman.isi}</p>

        <Link href="/pengumuman" className="font-bold text-biru underline">
            Kembali ke daftar pengumuman
        </Link>
        </article>
    );
}