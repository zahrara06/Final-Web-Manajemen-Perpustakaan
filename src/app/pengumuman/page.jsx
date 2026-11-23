import Link from "next/link";
import pool from "@/lib/db";
import { formatTanggal } from "@/lib/util";
import Badge from "@/components/Badge";

export default async function DaftarPengumuman() {
    const { rows } = await pool.query(
        "SELECT id, judul, kategori, tanggal_rilis, LEFT(isi, 160) AS ringkasan FROM pengumuman WHERE status = 'Published' ORDER BY tanggal_rilis DESC, id DESC"
    );
    return (
        <>
        <h1>Pengumuman Perpustakaan</h1>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">
            {rows.map((p) => (
            <Link key={p.id} href={`/pengumuman/${p.id}`} className="block border-[2.5px] border-biru-tua rounded-[18px] shadow-keras p-5 bg-white">
                <Badge>{p.kategori}</Badge>
                <h3 className="mt-2.5 mb-1">{p.judul}</h3>
                <p>{p.ringkasan}...</p>
                <small className="mt-1 block">{formatTanggal(p.tanggal_rilis)}</small>
            </Link>
            ))}
        </div>
        {rows.length === 0 && <p className="p-5 text-center opacity-70">Belum ada pengumuman.</p>}
        </>
    );
}
