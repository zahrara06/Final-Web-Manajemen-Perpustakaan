import Link from "next/link";
import pool from "@/lib/db";
import { formatTanggal } from "@/lib/util";
import Latar3D from "@/components/Latar3D";
import BookCard from "@/components/BookCard";
import Badge from "@/components/StatusBadge";

export default async function Beranda() {
    const populer = await pool.query(`
        SELECT
            b.id,
            b.judul,
            b.penulis,
            b.gambar_sampul,
            k.nama AS nama_kategori,
            COUNT(p.id) AS total_pinjam
        FROM buku b
        JOIN kategori k ON k.id = b.kategori_id
        LEFT JOIN peminjaman p
            ON p.buku_id = b.id
            AND p.status IN ('Sedang Dipinjam', 'Selesai')
        GROUP BY b.id, k.nama
        ORDER BY total_pinjam DESC, b.judul
        LIMIT 5
    `);

    const kabar = await pool.query(`
        SELECT
            id,
            judul,
            kategori,
            tanggal_rilis,
            LEFT(isi, 130) AS ringkasan
        FROM pengumuman
        WHERE status = 'Published'
        ORDER BY tanggal_rilis DESC, id DESC
        LIMIT 3
    `);

    return (
        <>
            <section className="grid items-center overflow-hidden rounded-[28px] border-[2.5px] border-biru-tua bg-biru-tua text-white shadow-hero md:grid-cols-[1.15fr_0.85fr]">
                <div className="grid gap-4 p-[clamp(2rem,4vw,4rem)]">
                    <Badge>Perpustakaan Kampus Digital</Badge>

                    <h1>
                        Temukan bacaan berikutnya di{" "}
                        <mark className="inline-block -rotate-[1.5deg] rounded-lg bg-kuning px-[0.3em] text-biru-tua">
                            LiteraSpace
                        </mark>
                    </h1>

                    <p className="max-w-[46ch] text-biru-muda">
                        Telusuri koleksi, ajukan pinjaman dari mana saja, lalu
                        ambil bukunya di meja sirkulasi.
                    </p>

                    <form
                        action="/katalog"
                        className="flex gap-2.5 [&_input]:min-w-0 [&_input]:flex-1"
                    >
                        <input
                            name="q"
                            placeholder="Cari judul atau pengarang..."
                            aria-label="Cari buku"
                        />

                        <button className="inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-5 py-2.5 shadow-tombol bg-kuning">
                            Cari
                        </button>
                    </form>
                </div>

                <div
                    className="h-[clamp(300px,52vh,560px)] bg-[radial-gradient(circle,#1d4ed8,#0b1b4d_70%)]"
                    aria-hidden="true"
                >
                    <Latar3D />
                </div>
            </section>

            <section>
                <div className="flex items-baseline justify-between gap-4 mb-5">
                    <h2>5 Buku Terpopuler</h2>

                    <Link
                        href="/katalog"
                        className="font-bold text-biru underline"
                    >
                        Lihat semua koleksi
                    </Link>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-6">
                    {populer.rows.map((buku, i) => (
                        <BookCard
                            key={buku.id}
                            buku={buku}
                            peringkat={i + 1}
                        />
                    ))}
                </div>
            </section>

            <section>
                <div className="flex items-baseline justify-between gap-4 mb-5">
                    <h2>Pengumuman Terbaru</h2>

                    <Link
                        href="/pengumuman"
                        className="font-bold text-biru underline"
                    >
                        Semua pengumuman
                    </Link>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">
                    {kabar.rows.map((pengumuman) => (
                        <Link
                            key={pengumuman.id}
                            href={`/pengumuman/${pengumuman.id}`}
                            className="block border-[2.5px] border-biru-tua rounded-[18px] shadow-keras p-5 bg-white"
                        >
                            <Badge>{pengumuman.kategori}</Badge>

                            <h3 className="mt-2.5 mb-1">
                                {pengumuman.judul}
                            </h3>

                            <p>{pengumuman.ringkasan}...</p>

                            <small className="mt-1 block">
                                {formatTanggal(pengumuman.tanggal_rilis)}
                            </small>
                        </Link>
                    ))}

                    {kabar.rowCount === 0 && (
                        <p className="p-5 text-center opacity-70">
                            Belum ada pengumuman.
                        </p>
                    )}
                </div>
            </section>
        </>
    );
}
