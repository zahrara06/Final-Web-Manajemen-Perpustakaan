import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request, { params }) {
    const { id } = await params;

    if (!/^\d+$/.test(id)) {
        return new NextResponse("Tidak ditemukan.", { status: 404 });
    }

    const { rows } = await pool.query(
        "SELECT data, tipe FROM sampul_buku WHERE buku_id = $1",
        [id]
    );

    if (!rows[0]) {
        return new NextResponse("Tidak ditemukan.", { status: 404 });
    }

    return new NextResponse(rows[0].data, {
        headers: {
            "Content-Type": rows[0].tipe,
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}