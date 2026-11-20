"use server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { keluar } from "@/lib/util";

const P = "/admin/kategori";

function ambil(formData) {
    return {
        nama: String(formData.get("nama") || "").trim(),
        kode: String(formData.get("kode") || "").trim(),
        deskripsi: String(formData.get("deskripsi") || "").trim(),
    };
}

export async function simpanKategori(formData) {
    await requireRole("admin");

    const { nama, kode, deskripsi } = ambil(formData);

    if (!nama || !kode) {
        keluar(P, "error", "Nama dan kode wajib diisi.");
    }

    try {
        await pool.query(
            `INSERT INTO categories (nama, kode, deskripsi)
             VALUES ($1, $2, $3)`,
            [nama, kode, deskripsi]
        );
    } catch (e) {
        if (e.code === "23505") {
            keluar(P, "error", "Nama atau kode sudah dipakai.");
        }

        throw e;
    }

    keluar(P, "ok", "Kategori ditambahkan.");
}

export async function ubahKategori(formData) {
    await requireRole("admin");

    const id = Number(formData.get("id"));
    const { nama, kode, deskripsi } = ambil(formData);

    if (!nama || !kode) {
        keluar(P, "error", "Nama dan kode wajib diisi.");
    }

    try {
        await pool.query(
            `UPDATE categories
             SET nama = $1, kode = $2, deskripsi = $3
             WHERE id = $4`,
            [nama, kode, deskripsi, id]
        );
    } catch (e) {
        if (e.code === "23505") {
            keluar(P, "error", "Nama atau kode sudah dipakai.");
        }

        throw e;
    }

    keluar(P, "ok", "Kategori diperbarui.");
}

export async function hapusKategori(formData) {
    await requireRole("admin");

    const id = Number(formData.get("id"));

    const { rows: [c] } = await pool.query(
        `SELECT COUNT(*)::int AS n
         FROM books
         WHERE category_id = $1`,
        [id]
    );

    if (c.n > 0) {
        keluar(P, "error", `Masih ada ${c.n} buku pada kategori ini.`);
    }

    await pool.query(
        "DELETE FROM categories WHERE id = $1",
        [id]
    );

    keluar(P, "ok", "Kategori dihapus.");
}
