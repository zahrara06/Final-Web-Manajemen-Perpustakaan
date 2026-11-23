"use server";

import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { ambilTeks, ambilAngka, jalankan } from "@/lib/util";

function bacaKategori(formData) {
    const data = {
        nama: ambilTeks(formData, "nama"),
        kode: ambilTeks(formData, "kode").toUpperCase(),
        deskripsi: ambilTeks(formData, "deskripsi"),
    };

    if (!data.nama || !data.kode) {
        throw new Error("Nama dan kode kategori wajib diisi.");
    }

    return data;
}

export async function tambahKategori(formData) {
    await wajibPeran("Admin");

    await jalankan("/admin/kategori", "Kategori ditambahkan.", async () => {
        const { nama, kode, deskripsi } = bacaKategori(formData);

        await pool.query(
            "INSERT INTO kategori (nama, kode, deskripsi) VALUES ($1, $2, $3)",
            [nama, kode, deskripsi]
        );
    });
}

export async function ubahKategori(formData) {
    await wajibPeran("Admin");

    await jalankan("/admin/kategori", "Kategori diperbarui.", async () => {
        const { nama, kode, deskripsi } = bacaKategori(formData);
        const id = ambilAngka(formData, "id");

        await pool.query(
            "UPDATE kategori SET nama = $1, kode = $2, deskripsi = $3 WHERE id = $4",
            [nama, kode, deskripsi, id]
        );
    });
}

export async function hapusKategori(formData) {
    await wajibPeran("Admin");

    await jalankan("/admin/kategori", "Kategori dihapus.", async () => {
        const id = ambilAngka(formData, "id");
        const terpakai = await pool.query(
            "SELECT COUNT(*)::int AS jumlah FROM buku WHERE kategori_id = $1",
            [id]
        );

        if (terpakai.rows[0].jumlah > 0) {
            throw new Error(
                "Kategori tidak dapat dihapus karena masih dipakai oleh buku."
            );
        }

        await pool.query("DELETE FROM kategori WHERE id = $1", [id]);
    });
}