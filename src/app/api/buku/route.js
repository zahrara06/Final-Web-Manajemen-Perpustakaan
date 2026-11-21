import pool from "@/lib/db";

export async function GET(request) {
    const q = (
        new URL(request.url).searchParams.get("q") || ""
    ).slice(0, 100);

    const { rows } = await pool.query(
        `SELECT
            b.id,
            b.judul,
            b.pengarang,
            b.tahun_terbit,
            b.stok_tersedia,
            c.nama AS kategori
        FROM books b
        JOIN categories c ON c.id = b.category_id
        WHERE
            b.judul ILIKE '%' || $1::text || '%'
            OR b.pengarang ILIKE '%' || $1::text || '%'
        ORDER BY b.judul`,
        [q]
    );

    return Response.json(rows);
}