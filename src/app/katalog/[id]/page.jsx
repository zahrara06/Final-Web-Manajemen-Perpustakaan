import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { getUser } from "@/lib/auth";
import Pesan from "@/components/Pesan";
import { ajukanPinjam, beriUlasan, reservasiBuku } from "@/app/actions/loans";
import { rupiah, tgl } from "@/lib/util";

export const dynamic = "force-dynamic";

export default async function DetailBukuPage({ params, searchParams }) {
    const { id } = await params;
    const sp = await searchParams;

    if (!Number.isInteger(Number(id))) {
        notFound();
    }

    const { rows: [b] } = await pool.query(
        `SELECT
            b.*,
            c.nama AS kategori,
            COALESCE(AVG(r.rating), 0)::float AS rating,
            COUNT(r.id)::int AS jml_ulasan
         FROM books b
         JOIN categories c ON c.id = b.category_id
         LEFT JOIN reviews r ON r.book_id = b.id
         WHERE b.id = $1
         GROUP BY b.id, c.nama`,
        [id]
    );

    if (!b) {
        notFound();
    }

    const ulasan = (
        await pool.query(
            `SELECT
                r.rating,
                r.komentar,
                r.created_at,
                u.nama
             FROM reviews r
             JOIN users u ON u.id = r.user_id
             WHERE r.book_id = $1
             ORDER BY r.created_at DESC`,
            [id]
        )
    ).rows;

    const user = await getUser();

    let diblokir = false;
    let sudahAda = false;
    let sudahAntre = false;
    let loanUlasan = null;

    if (user?.role === "mahasiswa") {
        diblokir = (
            await pool.query(
                `SELECT 1 FROM loans
                 WHERE user_id = $1
                 AND denda_status = 'tertunggak'
                 LIMIT 1`,
                [user.id]
            )
        ).rowCount > 0;

        sudahAda = (
            await pool.query(
                `SELECT 1 FROM loans
                 WHERE user_id = $1
                 AND book_id = $2
                 AND status IN ('menunggu', 'dipinjam')`,
                [user.id, id]
            )
        ).rowCount > 0;

        sudahAntre = (
            await pool.query(
                `SELECT 1 FROM reservations
                 WHERE user_id = $1
                 AND book_id = $2
                 AND status IN ('antre', 'diberitahu')`,
                [user.id, id]
            )
        ).rowCount > 0;

        loanUlasan = (
            await pool.query(
                `SELECT id FROM loans
                 WHERE user_id = $1
                 AND book_id = $2
                 AND status = 'selesai'
                 ORDER BY id DESC
                 LIMIT 1`,
                [user.id, id]
            )
        ).rows[0];
    }

    return (
        <div className="space-y-8">
            <Pesan sp={sp} />

            <div className="card grid md:grid-cols-3 gap-6">
                {b.cover_url ? (
                    <img
                        src={b.cover_url}
                        alt={b.judul}
                        className="w-full max-w-xs mx-auto rounded-lg object-cover"
                    />
                ) : (
                    <div className="h-64 bg-purple-100 rounded-lg flex items-center justify-center text-6xl">
                        📘
                    </div>
                )}

                <div className="md:col-span-2">
                    <span className="text-xs text-purple-600 font-medium">
                        {b.kategori}
                    </span>

                    <h1 className="text-2xl font-bold text-purple-900">
                        {b.judul}
                    </h1>

                    <p className="text-slate-500 mb-3">
                        ⭐ {b.rating.toFixed(1)} ({b.jml_ulasan} ulasan)
                    </p>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-5">
                        <dt className="text-slate-500">ISBN</dt>
                        <dd>{b.isbn}</dd>

                        <dt className="text-slate-500">Pengarang</dt>
                        <dd>{b.pengarang}</dd>

                        <dt className="text-slate-500">Penerbit</dt>
                        <dd>{b.penerbit}</dd>

                        <dt className="text-slate-500">Tahun terbit</dt>
                        <dd>{b.tahun_terbit}</dd>

                        <dt className="text-slate-500">Sisa stok</dt>
                        <dd>{b.stok_tersedia} dari {b.stok_total}</dd>

                        <dt className="text-slate-500">Maks. lama pinjam</dt>
                        <dd>{b.durasi_maks} hari</dd>

                        <dt className="text-slate-500">Denda harian</dt>
                        <dd>{rupiah(b.denda_per_hari)}</dd>
                    </dl>

                    {!user && (
                        <p className="text-sm">
                            <Link
                                href="/login"
                                className="text-purple-600 hover:underline"
                            >
                                Masuk sebagai Mahasiswa
                            </Link>{" "}
                            untuk meminjam buku ini.
                        </p>
                    )}

                    {user && user.role !== "mahasiswa" && (
                        <p className="text-sm text-slate-500">
                            Hanya akun Mahasiswa yang dapat meminjam.
                        </p>
                    )}

                    {user?.role === "mahasiswa" && (
                        <div className="space-y-2">
                            <form action={ajukanPinjam}>
                                <input
                                    type="hidden"
                                    name="book_id"
                                    value={b.id}
                                />

                                <button
                                    className="btn"
                                    disabled={
                                        diblokir ||
                                        b.stok_tersedia <= 0 ||
                                        sudahAda
                                    }
                                >
                                    Ajukan Pinjam
                                </button>
                            </form>

                            {b.stok_tersedia <= 0 && !sudahAntre && (
                                <form action={reservasiBuku}>
                                    <input
                                        type="hidden"
                                        name="book_id"
                                        value={b.id}
                                    />

                                    <button className="btn-sec">
                                        Reservasi (masuk antrean)
                                    </button>
                                </form>
                            )}

                            {diblokir && (
                                <p className="text-sm text-red-600">
                                    Diblokir: lunasi denda tertunggak Anda terlebih dahulu.
                                </p>
                            )}

                            {!diblokir && b.stok_tersedia <= 0 && (
                                <p className="text-sm text-amber-700">
                                    Stok sedang habis.
                                </p>
                            )}

                            {sudahAntre && (
                                <p className="text-sm text-purple-700">
                                    Anda sudah berada dalam antrean buku ini.
                                </p>
                            )}

                            {sudahAda && (
                                <p className="text-sm text-amber-700">
                                    Anda sudah mengajukan/meminjam buku ini.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <section id="ulasan" className="space-y-4">
                <h2 className="text-xl font-bold text-purple-900">
                    Ulasan Mahasiswa
                </h2>

                {loanUlasan && (
                    <form action={beriUlasan} className="card space-y-3">
                        <input
                            type="hidden"
                            name="book_id"
                            value={b.id}
                        />

                        <input
                            type="hidden"
                            name="loan_id"
                            value={loanUlasan.id}
                        />

                        <h3 className="font-semibold">Tulis ulasan Anda</h3>

                        <select
                            name="rating"
                            required
                            defaultValue="5"
                            className="inp sm:w-40"
                        >
                            {[5, 4, 3, 2, 1].map((n) => (
                                <option key={n} value={n}>
                                    {"⭐".repeat(n)} ({n})
                                </option>
                            ))}
                        </select>

                        <textarea
                            name="komentar"
                            rows={3}
                            required
                            placeholder="Komentar Anda..."
                            className="inp"
                        />

                        <button className="btn">Kirim Ulasan</button>
                    </form>
                )}

                {ulasan.map((u, i) => (
                    <div key={i} className="card">
                        <p className="font-medium">
                            {u.nama}{" "}
                            <span className="text-amber-500">
                                {"⭐".repeat(u.rating)}
                            </span>
                        </p>

                        <p className="text-sm text-slate-600">
                            {u.komentar}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                            {tgl(u.created_at)}
                        </p>
                    </div>
                ))}

                {ulasan.length === 0 && (
                    <p className="text-slate-500 text-sm">
                        Belum ada ulasan.
                    </p>
                )}
            </section>
        </div>
    );
}
