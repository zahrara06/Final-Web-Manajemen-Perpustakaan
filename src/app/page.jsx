import Link from "next/link";
import pool from "@/lib/db";
import BookCard from "@/components/BookCard";
import { tgl } from "@/lib/util";

export const dynamic = "force-dynamic";

export default async function Home() {
    const populer = (await pool.query(
        `SELECT b.id, b.judul, b.pengarang, b.cover_url, COUNT(l.id)::int AS total_pinjam
         FROM books b
         LEFT JOIN loans l ON l.book_id = b.id AND l.status IN ('dipinjam','selesai')
         GROUP BY b.id
         ORDER BY total_pinjam DESC, b.judul
         LIMIT 5`
    )).rows;

    const info = (await pool.query(
        `SELECT id, judul, kategori, tanggal_rilis, LEFT(konten, 120) AS ringkas
         FROM announcements
         WHERE status = 'Published'
         ORDER BY tanggal_rilis DESC, id DESC
         LIMIT 3`
    )).rows;

    return (
        <div className="space-y-10">
            <section className="bg-purple-700 text-white rounded-2xl p-8 text-center">
                <h1 className="text-3xl font-bold mb-2">
                    Selamat Datang di Pustakaloka
                </h1>

                <p className="text-purple-100 mb-5">
                    Cari koleksi buku berdasarkan judul atau pengarang.
                </p>

                <form action="/katalog" className="flex gap-2 max-w-xl mx-auto">
                    <input
                        name="q"
                        placeholder="Cari judul atau pengarang..."
                        className="inp"
                    />
                    <button className="btn bg-purple-900 hover:bg-purple-800">
                        Cari
                    </button>
                </form>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-3 text-purple-900">
                    🔥 5 Buku Terpopuler
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {populer.map((b) => (
                        <BookCard key={b.id} b={b} />
                    ))}
                </div>
            </section>

            <section>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold text-purple-900">
                        📢 Pengumuman Terbaru
                    </h2>

                    <Link
                        href="/pengumuman"
                        className="text-sm text-purple-600 hover:underline"
                    >
                        Lihat semua →
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {info.map((a) => (
                        <Link
                            key={a.id}
                            href={`/pengumuman/${a.id}`}
                            className="card hover:border-purple-300 hover:shadow-md transition"
                        >
                            <span className="text-xs text-purple-600 font-medium">
                                {a.kategori} • {tgl(a.tanggal_rilis)}
                            </span>

                            <h3 className="font-semibold mt-1">
                                {a.judul}
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                {a.ringkas}...
                            </p>
                        </Link>
                    ))}

                    {info.length === 0 && (
                        <p className="text-slate-500">
                            Belum ada pengumuman.
                        </p>
                    )}
                </div>
            </section>

        </div>
    );
}
