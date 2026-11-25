import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ambilSesi } from "@/lib/auth";

export async function GET(request, { params }) {
    const sesi = await ambilSesi();

    if (!sesi) {
        return new NextResponse("Tidak diizinkan.", { status: 403 });
    }

    const { id } = await params;

    if (!/^\d+$/.test(id)) {
        return new NextResponse("Tidak ditemukan.", { status: 404 });
    }

    const { rows } = await pool.query(
        "SELECT foto, foto_tipe FROM pengguna WHERE id = $1",
        [id]
    );

    if (!rows[0]?.foto) {
        return new NextResponse("Tidak ditemukan.", { status: 404 });
    }

    return new NextResponse(rows[0].foto, {
        headers: {
            "Content-Type": rows[0].foto_tipe || "image/jpeg",
            "Cache-Control": "private, no-cache",
        },
    });
}