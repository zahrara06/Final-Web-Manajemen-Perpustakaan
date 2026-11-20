"use server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { keluar } from "@/lib/util";

const P = "/kelola/pengumuman";

function ambil(formData) {
    return {
        judul: String(formData.get("judul") || "").trim(),
        konten: String(formData.get("konten") || "").trim(),
        kategori: String(formData.get("kategori") || ""),
        tanggal: String(formData.get("tanggal_rilis") || ""),
        status: String(formData.get("status") || ""),
    };
}

function cek(d) {
    if (!d.judul || !d.konten) {
        return "Judul dan konten wajib diisi.";
    }

    if (!["Operasional", "Layanan", "Acara"].includes(d.kategori)) {
        return "Kategori tidak valid.";
    }

    if (!["Draft", "Published"].includes(d.status)) {
        return "Status tidak valid.";
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.tanggal)) {
        return "Tanggal rilis tidak valid.";
    }

    return null;
}

export async function simpanPengumuman(formData) {
    const user = await requireRole("pegawai", "admin");

    const d = ambil(formData);
    const err = cek(d);

    if (err) {
        keluar(P, "error", err);
    }

    await pool.query(
        `INSERT INTO announcements
         (judul, konten, kategori, tanggal_rilis, status, author_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [d.judul, d.konten, d.kategori, d.tanggal, d.status, user.id]
    );

    keluar(P, "ok", "Pengumuman ditambahkan.");
}

export async function ubahPengumuman(formData) {
    await requireRole("pegawai", "admin");

    const id = Number(formData.get("id"));
    const d = ambil(formData);
    const err = cek(d);

    if (err) {
        keluar(P, "error", err);
    }

    await pool.query(
        `UPDATE announcements
         SET judul = $1, konten = $2, kategori = $3,
             tanggal_rilis = $4, status = $5
         WHERE id = $6`,
        [d.judul, d.konten, d.kategori, d.tanggal, d.status, id]
    );

    keluar(P, "ok", "Pengumuman diperbarui.");
}

export async function hapusPengumuman(formData) {
    await requireRole("pegawai", "admin");

    await pool.query(
        "DELETE FROM announcements WHERE id = $1",
        [Number(formData.get("id"))]
    );

    keluar(P, "ok", "Pengumuman dihapus.");
}
