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
        "SELECT pengguna_id, data, tipe FROM bukti_bayar WHERE id = $1",
        [id]
    );

    if (!rows[0]) {
        return new NextResponse("Tidak ditemukan.", { status: 404 });
    }

    const petugas = sesi.peran === "Pegawai" || sesi.peran === "Admin";

    if (!petugas && rows[0].pengguna_id !== sesi.id) {
        return new NextResponse("Tidak diizinkan.", { status: 403 });
    }

    return new NextResponse(rows[0].data, {
        headers: {
            "Content-Type": rows[0].tipe,
            "Cache-Control": "private, max-age=3600",
        },
    });
}