import pool from "@/lib/db";
import BookCard from "@/components/BookCard";

const URUTAN = {
  judul: "b.judul ASC",
  tahun: "b.tahun_terbit DESC, b.judul",
  rating: "rata_rating DESC, b.judul",
};

const KELAS_TOMBOL =
  "inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-5 py-2.5 shadow-tombol bg-kuning";

export default async function Katalog({ searchParams }) {
    const sp = await searchParams;
    const kata = (sp.q ?? "").trim();
    const kategoriId = Number(sp.kategori) || 0;
    const urutan = URUTAN[sp.urut] ?? URUTAN.judul;

    const kategori = await pool.query(
        "SELECT id, nama FROM kategori ORDER BY nama"
    );

    const buku = await pool.query(
        `SELECT b.*,
                k.nama AS nama_kategori,
                COALESCE(ROUND(AVG(u.rating), 1), 0) AS rata_rating
        FROM buku b
        JOIN kategori k ON k.id = b.kategori_id
        LEFT JOIN ulasan u ON u.buku_id = b.id
        WHERE ($1::text = ''
                OR b.judul ILIKE '%' || $1 || '%'
                OR b.penulis ILIKE '%' || $1 || '%')
        AND ($2::int = 0 OR b.kategori_id = $2)
        GROUP BY b.id, k.nama
        ORDER BY ${urutan}`,
        [kata, kategoriId]
    );

    return (
        <>
        <h1>Katalog Buku</h1>

        <form className="flex flex-wrap items-center gap-3 [&_input]:w-auto [&_input]:min-w-[150px] [&_input]:flex-1 [&_select]:w-auto [&_select]:min-w-[150px] [&_select]:flex-1">
            <input
            name="q"
            defaultValue={kata}
            placeholder="Judul atau pengarang"
            aria-label="Kata kunci"
            />

            <select
                name="kategori"
                defaultValue={String(kategoriId)}
                aria-label="Kategori"
                >
                <option value="0">Semua kategori</option>
                {kategori.rows.map((k) => (
                    <option key={k.id} value={k.id}>
                    {k.nama}
                    </option>
                ))}
            </select>

            <select
                name="urut"
                defaultValue={sp.urut ?? "judul"}
                aria-label="Urutkan"
                >
                <option value="judul">Urutkan: Judul A-Z</option>
                <option value="tahun">Urutkan: Tahun terbit terbaru</option>
                <option value="rating">Urutkan: Rating tertinggi</option>
            </select>

            <button type="submit" className={KELAS_TOMBOL}>
                Terapkan
            </button>
        </form>

        {buku.rowCount === 0 ? (
            <p className="p-5 text-center opacity-70">
            Tidak ada buku yang cocok. Coba kata kunci atau kategori lain.
            </p>
        ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-6">
            {buku.rows.map((b) => (
                <BookCard key={b.id} buku={b} />
            ))}
            </div>
        )}
        </>
    );
}