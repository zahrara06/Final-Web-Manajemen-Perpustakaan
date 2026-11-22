"use server";

import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { ambilTeks, ambilAngka, jalankan } from "@/lib/util";

function bacaPengumuman(formData) {
    const data = {
        judul: ambilTeks(formData, "judul"),
        isi: ambilTeks(formData, "isi"),
        kategori: ambilTeks(formData, "kategori"),
        tanggal_rilis: ambilTeks(formData, "tanggal_rilis"),
        status: ambilTeks(formData, "status"),
    };

    if (!data.judul || !data.isi) {
        throw new Error("Judul dan isi pengumuman wajib diisi.");
    }

    if (!data.tanggal_rilis) {
        throw new Error("Tanggal rilis wajib diisi.");
    }

    return data;
}

export async function tambahPengumuman(formData) {
    const sesi = await wajibPeran("Pegawai", "Admin");

    await jalankan("/kelola/pengumuman", "Pengumuman ditambahkan.", async () => {
        const p = bacaPengumuman(formData);

        await pool.query(
        `INSERT INTO pengumuman (judul, isi, kategori, tanggal_rilis, status, penulis_id)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [p.judul, p.isi, p.kategori, p.tanggal_rilis, p.status, sesi.id]
        );
    });
}

export async function ubahPengumuman(formData) {
    await wajibPeran("Pegawai", "Admin");

    await jalankan("/kelola/pengumuman", "Pengumuman diperbarui.", async () => {
        const p = bacaPengumuman(formData);
        const id = ambilAngka(formData, "id");

        await pool.query(
        `UPDATE pengumuman
        SET judul = $1, isi = $2, kategori = $3, tanggal_rilis = $4, status = $5
        WHERE id = $6`,
        [p.judul, p.isi, p.kategori, p.tanggal_rilis, p.status, id]
        );
    });
}

export async function hapusPengumuman(formData) {
    await wajibPeran("Pegawai", "Admin");

    await jalankan("/kelola/pengumuman", "Pengumuman dihapus.", async () => {
        const id = ambilAngka(formData, "id");

        await pool.query("DELETE FROM pengumuman WHERE id = $1", [id]);
    });
}