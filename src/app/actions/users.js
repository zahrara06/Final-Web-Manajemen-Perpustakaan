"use server";

import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { ambilTeks, ambilAngka, jalankan } from "@/lib/util";

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAFTAR_PERAN = ["Admin", "Pegawai", "Mahasiswa"];

export async function tambahPengguna(formData) {
    await wajibPeran("Admin");

    await jalankan(
        "/admin/users",
        "Pengguna berhasil ditambahkan.",
        async () => {
            const namaLengkap = ambilTeks(formData, "nama_lengkap");
            const email = ambilTeks(formData, "email").toLowerCase();
            const kataSandi = String(formData.get("kata_sandi") ?? "");
            const peran = ambilTeks(formData, "peran");
            const nomorIdentitas = ambilTeks(formData, "nomor_identitas");

            if (!namaLengkap || !email || !kataSandi || !nomorIdentitas) {
                throw new Error("Semua data wajib diisi.");
            }

            if (!POLA_EMAIL.test(email)) {
                throw new Error("Format email tidak valid.");
            }

            if (!DAFTAR_PERAN.includes(peran)) {
                throw new Error("Peran tidak valid.");
            }

            const hash = await bcrypt.hash(kataSandi, 10);

            await pool.query(
                `INSERT INTO pengguna (
                nama_lengkap, email, kata_sandi_hash, peran, nomor_identitas
                )
                VALUES ($1, $2, $3, $4, $5)`,
                [namaLengkap, email, hash, peran, nomorIdentitas]
            );
        }
    );
}

export async function ubahPengguna(formData) {
    const sesi = await wajibPeran("Admin");

    await jalankan("/admin/users", "Data pengguna diperbarui.", async () => {
        const id = ambilAngka(formData, "id");
        const namaLengkap = ambilTeks(formData, "nama_lengkap");
        const email = ambilTeks(formData, "email").toLowerCase();
        const peran = ambilTeks(formData, "peran");
        const aktif = ambilTeks(formData, "aktif") === "true";

        if (!namaLengkap || !email) {
            throw new Error("Nama dan email tidak boleh kosong.");
        }

        if (!POLA_EMAIL.test(email)) {
            throw new Error("Format email tidak valid.");
        }

        if (!DAFTAR_PERAN.includes(peran)) {
            throw new Error("Peran tidak valid.");
        }

        if (id === sesi.id && (!aktif || peran !== "Admin")) {
            throw new Error(
                "Anda tidak dapat menonaktifkan atau menurunkan peran akun sendiri."
            );
        }

        await pool.query(
            `UPDATE pengguna
            SET nama_lengkap = $1,
                email = $2,
                peran = $3,
                aktif = $4
            WHERE id = $5`,
            [namaLengkap, email, peran, aktif, id]
        );
    });
}

export async function hapusPengguna(formData) {
    const sesi = await wajibPeran("Admin");

    await jalankan("/admin/users", "Pengguna dihapus.", async () => {
        const id = ambilAngka(formData, "id");

        if (id === sesi.id) {
            throw new Error("Anda tidak dapat menghapus akun sendiri.");
        }

        const aktif = await pool.query(
            `SELECT 1
            FROM peminjaman
            WHERE pengguna_id = $1
                AND status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')
            LIMIT 1`,
            [id]
        );

        if (aktif.rowCount > 0) {
            throw new Error(
                "Pengguna tidak dapat dihapus karena masih memiliki transaksi aktif."
            );
        }

        await pool.query("DELETE FROM pengguna WHERE id = $1", [id]);
    });
}