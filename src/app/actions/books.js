"use server";

import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { ambilTeks, ambilAngka, jalankan } from "@/lib/util";

function bacaBuku(formData) {
    const data = {
        judul: ambilTeks(formData, "judul"),
        penulis: ambilTeks(formData, "penulis"),
        penerbit: ambilTeks(formData, "penerbit"),
        gambarSampul: ambilTeks(formData, "gambar_sampul") || null,
        tahunTerbit: ambilAngka(formData, "tahun_terbit"),
        kategoriId: ambilAngka(formData, "kategori_id"),
        stokTotal: ambilAngka(formData, "stok_total"),
        durasiPinjam: ambilAngka(formData, "durasi_pinjam_hari"),
        dendaPerHari: ambilAngka(formData, "denda_per_hari"),
    };

    if (!data.judul || !data.penulis || !data.penerbit) {
        throw new Error("Judul, penulis, dan penerbit wajib diisi.");
    }

    const angkaWajib = [
        data.tahunTerbit,
        data.kategoriId,
        data.stokTotal,
        data.durasiPinjam,
        data.dendaPerHari,
    ];

    if (angkaWajib.some((n) => !Number.isInteger(n))) {
        throw new Error(
            "Tahun, kategori, stok, durasi, dan denda harus berupa bilangan bulat."
        );
    }

    if (data.stokTotal < 0 || data.dendaPerHari < 0) {
        throw new Error("Stok dan denda tidak boleh negatif.");
    }

    if (data.durasiPinjam < 1) {
        throw new Error("Durasi pinjam minimal 1 hari.");
    }

    return data;
}

export async function tambahBuku(formData) {
    await wajibPeran("Pegawai", "Admin");

    await jalankan("/kelola/buku", "Buku berhasil ditambahkan.", async () => {
        const isbn = ambilTeks(formData, "isbn");
        if (!isbn) {
            throw new Error("ISBN wajib diisi.");
        }

        const b = bacaBuku(formData);
        await pool.query(
            `INSERT INTO buku (
                judul, isbn, penulis, penerbit, tahun_terbit, kategori_id,
                stok_total, stok_tersedia, durasi_pinjam_hari, denda_per_hari, gambar_sampul
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10)`,
            [
            b.judul,
            isbn,
            b.penulis,
            b.penerbit,
            b.tahunTerbit,
            b.kategoriId,
            b.stokTotal,
            b.durasiPinjam,
            b.dendaPerHari,
            b.gambarSampul,
            ]
        );
    });
}

export async function ubahBuku(formData) {
    await wajibPeran("Pegawai", "Admin");

    await jalankan("/kelola/buku", "Data buku diperbarui.", async () => {
        const b = bacaBuku(formData);
        const id = ambilAngka(formData, "id");

        await pool.query(
            `UPDATE buku
            SET judul = $1,
                penulis = $2,
                penerbit = $3,
                tahun_terbit = $4,
                kategori_id = $5,
                stok_tersedia = stok_tersedia + ($6 - stok_total),
                stok_total = $6,
                durasi_pinjam_hari = $7,
                denda_per_hari = $8,
                gambar_sampul = $9
            WHERE id = $10`,
            [
                b.judul,
                b.penulis,
                b.penerbit,
                b.tahunTerbit,
                b.kategoriId,
                b.stokTotal,
                b.durasiPinjam,
                b.dendaPerHari,
                b.gambarSampul,
                id,
            ]
        );
    });
}

export async function hapusBuku(formData) {
    await wajibPeran("Pegawai", "Admin");

    await jalankan("/kelola/buku", "Buku dihapus.", async () => {
        const id = ambilAngka(formData, "id");
        const dipinjam = await pool.query(
            `SELECT 1
            FROM peminjaman
            WHERE buku_id = $1
                AND status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')
            LIMIT 1`,
            [id]
        );

        if (dipinjam.rowCount > 0) {
            throw new Error(
                "Buku tidak dapat dihapus karena sedang dipinjam atau diajukan."
            );
        }

        await pool.query("DELETE FROM buku WHERE id = $1", [id]);
    });
}