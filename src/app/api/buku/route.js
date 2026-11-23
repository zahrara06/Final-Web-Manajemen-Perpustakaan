import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request) {
    const kata = (request.nextUrl.searchParams.get("q") ?? "").trim();

    const { rows } = await pool.query(
        `SELECT b.id,
                b.judul,
                b.penulis,
                b.isbn,
                b.tahun_terbit,
                k.nama AS kategori,
                b.stok_tersedia
        FROM buku b
        JOIN kategori k ON k.id = b.kategori_id
        WHERE ($1::text = ''
                OR b.judul ILIKE '%' || $1 || '%'
                OR b.penulis ILIKE '%' || $1 || '%')
        ORDER BY b.judul
        LIMIT 100`,
        [kata]
    );

    return NextResponse.json({
        jumlah: rows.length,
        data: rows,
    });
}