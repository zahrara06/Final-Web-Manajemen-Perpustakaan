import pool from "@/lib/db";
import BookCard from "@/components/BookCard";

export const dynamic = "force-dynamic";

const urutanBuku = {
    judul: "b.judul ASC",
    tahun: "b.tahun_terbit DESC",
    rating: "rating DESC, b.judul ASC",
};

export default async function KatalogPage({ searchParams }) {
    const parameter = await searchParams;

    const pencarian = (parameter.q || "").trim();
    const idKategori = Number(parameter.kategori) || null;
    const urutan = urutanBuku[parameter.urut] || urutanBuku.judul;

    const hasilKategori = await pool.query(
        "SELECT id, nama FROM categories ORDER BY nama"
    );
    const daftarKategori = hasilKategori.rows;

    const hasilBuku = await pool.query(
        `SELECT
            b.id,
            b.judul,
            b.pengarang,
            b.cover_url,
            b.stok_tersedia,
            c.nama AS kategori,
            COALESCE(AVG(r.rating), 0)::float AS rating
         FROM books b
         JOIN categories c ON c.id = b.category_id
         LEFT JOIN reviews r ON r.book_id = b.id
         WHERE ($1::text = '' OR b.judul ILIKE '%' || $1::text || '%' OR b.pengarang ILIKE '%' || $1::text || '%')
           AND ($2::int IS NULL OR b.category_id = $2::int)
         GROUP BY b.id, c.nama
         ORDER BY ${urutan}`,
        [pencarian, idKategori]
    );

    const daftarBuku = hasilBuku.rows;

    return (
        <div>
            <h1 className="text-2xl font-bold text-purple-900 mb-4">
                Katalog Buku
            </h1>

            <form className="card grid sm:grid-cols-4 gap-3 mb-6">
                <input
                    name="q"
                    defaultValue={pencarian}
                    placeholder="Judul / pengarang"
                    className="inp sm:col-span-2"
                />

                <select
                    name="kategori"
                    defaultValue={idKategori || ""}
                    className="inp"
                >
                    <option value="">Semua kategori</option>
                    {daftarKategori.map((kategori) => (
                        <option key={kategori.id} value={kategori.id}>
                            {kategori.nama}
                        </option>
                    ))}
                </select>

                <select
                    name="urut"
                    defaultValue={parameter.urut || "judul"}
                    className="inp"
                >
                    <option value="judul">Urut: Judul A-Z</option>
                    <option value="tahun">Urut: Tahun terbaru</option>
                    <option value="rating">Urut: Rating tertinggi</option>
                </select>

                <button className="btn sm:col-span-4">
                    Terapkan
                </button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {daftarBuku.map((buku) => (
                    <BookCard key={buku.id} b={buku} />
                ))}
            </div>

            {daftarBuku.length === 0 && (
                <p className="text-slate-500">
                    Tidak ada buku ditemukan.
                </p>
            )}
        </div>
    );
}
