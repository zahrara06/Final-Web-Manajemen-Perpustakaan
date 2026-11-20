"use server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { keluar } from "@/lib/util";

function ambil(formData) {
    const d = {
        judul: String(formData.get("judul") || "").trim(),
        isbn: String(formData.get("isbn") || "").trim(),
        pengarang: String(formData.get("pengarang") || "").trim(),
        penerbit: String(formData.get("penerbit") || "").trim(),
        tahun: Number(formData.get("tahun_terbit")),
        kategori: Number(formData.get("category_id")),
        stok: Number(formData.get("stok_total")),
        durasi: Number(formData.get("durasi_maks")),
        denda: Number(formData.get("denda_per_hari")),
        cover: String(formData.get("cover_url") || "").trim() || null,
    };

    let err = null;

    if (!d.judul || !d.isbn || !d.pengarang || !d.penerbit) {
        err = "Semua isian wajib diisi.";
    } else if (!Number.isInteger(d.tahun) || d.tahun < 1000 || d.tahun > 2100) {
        err = "Tahun terbit tidak valid.";
    } else if (!Number.isInteger(d.kategori) || d.kategori <= 0) {
        err = "Pilih kategori.";
    } else if (!Number.isInteger(d.stok) || d.stok < 0) {
        err = "Stok tidak boleh negatif.";
    } else if (!Number.isInteger(d.durasi) || d.durasi < 1) {
        err = "Durasi pinjam minimal 1 hari.";
    } else if (!Number.isInteger(d.denda) || d.denda < 0) {
        err = "Denda tidak boleh negatif.";
    }

    return { d, err };
}

export async function simpanBuku(formData) {
    await requireRole("pegawai", "admin");

    const { d, err } = ambil(formData);

    if (err) {
        keluar("/kelola/buku/baru", "error", err);
    }

    try {
        await pool.query(
            `INSERT INTO books
             (judul, isbn, pengarang, penerbit, tahun_terbit, category_id,
              stok_total, stok_tersedia, durasi_maks, denda_per_hari, cover_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10)`,
            [
                d.judul, d.isbn, d.pengarang, d.penerbit,
                d.tahun, d.kategori, d.stok, d.durasi, d.denda, d.cover
            ]
        );
    } catch (e) {
        if (e.code === "23505") {
            keluar("/kelola/buku/baru", "error", "ISBN sudah terdaftar.");
        }

        throw e;
    }

    keluar("/kelola/buku", "ok", "Buku ditambahkan.");
}

export async function ubahBuku(formData) {
    await requireRole("pegawai", "admin");

    const id = Number(formData.get("id"));
    const balik = `/kelola/buku/${id}`;
    const { d, err } = ambil(formData);

    if (err) {
        keluar(balik, "error", err);
    }

    const { rows: [c] } = await pool.query(
        `SELECT COUNT(*)::int AS n
         FROM loans
         WHERE book_id = $1 AND status = 'dipinjam'`,
        [id]
    );

    if (d.stok < c.n) {
        keluar(
            balik,
            "error",
            `Stok tidak boleh kurang dari jumlah yang sedang dipinjam (${c.n}).`
        );
    }

    try {
        await pool.query(
            `UPDATE books
             SET judul = $1, isbn = $2, pengarang = $3, penerbit = $4,
                 tahun_terbit = $5, category_id = $6, stok_total = $7,
                 stok_tersedia = $7 - $11::int, durasi_maks = $8,
                 denda_per_hari = $9, cover_url = $10
             WHERE id = $12`,
            [
                d.judul, d.isbn, d.pengarang, d.penerbit,
                d.tahun, d.kategori, d.stok, d.durasi,
                d.denda, d.cover, c.n, id
            ]
        );
    } catch (e) {
        if (e.code === "23505") {
            keluar(balik, "error", "ISBN sudah dipakai buku lain.");
        }

        throw e;
    }

    keluar("/kelola/buku", "ok", "Buku diperbarui.");
}

export async function hapusBuku(formData) {
    await requireRole("pegawai", "admin");

    const id = Number(formData.get("id"));

    const aktif = await pool.query(
        `SELECT 1
         FROM loans
         WHERE book_id = $1
         AND status IN ('menunggu', 'dipinjam')
         LIMIT 1`,
        [id]
    );

    if (aktif.rowCount > 0) {
        keluar(
            "/kelola/buku",
            "error",
            "Buku sedang dipinjam/diajukan, tidak dapat dihapus."
        );
    }

    await pool.query(
        "DELETE FROM books WHERE id = $1",
        [id]
    );

    keluar("/kelola/buku", "ok", "Buku dihapus.");
}
