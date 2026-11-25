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
            <header className="grid gap-2">
                <h1>Pengumuman Perpustakaan</h1>
                <p className="max-w-[60ch] opacity-80">
                    Informasi layanan, jadwal libur, dan agenda terbaru dari
                    perpustakaan kampus.
                </p>
            </header>

            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {rows.map((p, i) => (
                    <Link
                        key={p.id}
                        href={`/pengumuman/${p.id}`}
                        style={{ "--d": `${Math.min(i, 8) * 60}ms` }}
                        className="anim-naik group flex flex-col gap-2 rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 shadow-keras transition hover:-translate-y-1 hover:bg-kuning-muda"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <Badge>{p.kategori}</Badge>
                            <small>{formatTanggal(p.tanggal_rilis)}</small>
                        </div>

                        <h3 className="mt-1 text-lg">{p.judul}</h3>

                        <p className="line-clamp-4 flex-1 text-sm opacity-85">
                            {p.ringkasan}...
                        </p>

                        <span className="mt-2 font-bold text-biru">
                            Baca selengkapnya
                            <span className="ml-1 inline-block transition group-hover:translate-x-1.5">
                                →
                            </span>
                        </span>
                    </Link>
                ))}
            </div>

            {rows.length === 0 && (
                <p className="p-5 text-center opacity-70">
                    Belum ada pengumuman.
                </p>
            )}
        </>
    );
}