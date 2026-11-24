import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { formatTanggal } from "@/lib/util";
import Badge from "@/components/Badge";

const KELAS_TOMBOL =
    "inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] px-5 py-2.5 shadow-tombol bg-kuning";

function tanggalPanjang(teks) {
    const d = new Date(`${String(teks).slice(0, 10)}T00:00:00`);

    return Number.isNaN(d.getTime())
        ? formatTanggal(teks)
        : d.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
          });
}

export default async function DetailPengumuman({ params }) {
    const { id } = await params;
    if (!/^\d+$/.test(id)) notFound();

    const { rows } = await pool.query(
        "SELECT * FROM pengumuman WHERE id = $1 AND status = 'Published'",
        [id]
    );
    const pengumuman = rows[0];
    if (!pengumuman) notFound();

    const lainnya = await pool.query(
        `SELECT id, judul, kategori, tanggal_rilis
         FROM pengumuman
         WHERE status = 'Published' AND id <> $1
         ORDER BY tanggal_rilis DESC, id DESC
         LIMIT 30`,
        [id]
    );

    const paragraf = String(pengumuman.isi)
        .split(/\n\s*\n/)
        .map((teks) => teks.trim())
        .filter(Boolean);

    return (
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_300px]">
            <div className="grid gap-6">
                <div className="relative pt-4">
                    <div
                        aria-hidden="true"
                        className="absolute left-1/2 top-0 z-10 h-8 w-28 -translate-x-1/2 -rotate-2 border-2 border-biru-tua bg-kuning/80"
                    />

                    <article className="-rotate-[0.6deg] rounded-sm border-[2.5px] border-biru-tua bg-kuning-muda shadow-hero">
                        <header className="grid gap-3 border-b-[2.5px] border-dashed border-biru-tua px-[clamp(1.5rem,4vw,3rem)] pb-5 pt-9">
                            <Badge>{pengumuman.kategori}</Badge>

                            <h1 className="text-[1.5rem] leading-snug md:text-[1.85rem]">
                                {pengumuman.judul}
                            </h1>

                            <p className="text-sm font-bold opacity-70">
                                📅 {tanggalPanjang(pengumuman.tanggal_rilis)}
                            </p>
                        </header>

                        <div className="grid gap-8 bg-[repeating-linear-gradient(transparent_0_31px,#93c5fd_31px_32px)] px-[clamp(1.5rem,4vw,3rem)] pb-10 pt-8 text-[1.25rem] leading-8">
                            {paragraf.map((teks, i) => (
                                <p key={i} className="whitespace-pre-line">
                                    {teks}
                                </p>
                            ))}
                        </div>
                    </article>
                </div>

                <Link href="/pengumuman" className={`${KELAS_TOMBOL} w-fit`}>
                    ← Kembali
                </Link>
            </div>

            <aside className="lg:sticky lg:top-6">
                <h2 className="mb-4 border-b-[2.5px] border-biru-tua pb-2">
                    Pengumuman Lain
                </h2>

                {lainnya.rowCount === 0 ? (
                    <p className="opacity-70">Belum ada pengumuman lain.</p>
                ) : (
                    <ul className="h-[420px] overflow-y-scroll overscroll-contain pr-3 [scrollbar-color:#0b1b4d_#dbeafe] [scrollbar-width:thin]">
                        {lainnya.rows.map((p) => (
                            <li
                                key={p.id}
                                className="border-b-2 border-dashed border-biru-muda py-4 first:pt-0"
                            >
                                <Link
                                    href={`/pengumuman/${p.id}`}
                                    className="group grid gap-1"
                                >
                                    <Badge>{p.kategori}</Badge>

                                    <span className="font-bold text-biru-tua group-hover:underline">
                                        {p.judul}
                                    </span>

                                    <small className="opacity-70">
                                        {formatTanggal(p.tanggal_rilis)}
                                    </small>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </aside>
        </div>
    );
}