"use server";

import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { wajibPeran, buatSesi } from "@/lib/auth";
import { ambilTeks, jalankan } from "@/lib/util";

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POLA_KAMPUS = /^[^\s@]+@([a-z0-9-]+\.)*(ac\.id|edu)$/i;
const TIPE_FOTO = ["image/jpeg", "image/png", "image/webp"];
const BATAS_FOTO = 2 * 1024 * 1024;

export async function simpanProfil(formData) {
    const sesi = await wajibPeran("Admin", "Pegawai", "Mahasiswa");

    await jalankan("/profil", "Profil berhasil diperbarui.", async () => {
        const nama = ambilTeks(formData, "nama_lengkap");
        const email = ambilTeks(formData, "email").toLowerCase();
        const hapusFoto = ambilTeks(formData, "hapus_foto") === "ya";
        const sandiLama = String(formData.get("sandi_lama") ?? "");
        const sandiBaru = String(formData.get("sandi_baru") ?? "");
        const ulang = String(formData.get("ulangi") ?? "");
        const foto = formData.get("foto");

        if (!nama || !email) {
            throw new Error("Nama dan email tidak boleh kosong.");
        }

        if (!POLA_EMAIL.test(email)) {
            throw new Error("Format email tidak valid.");
        }

        if (sesi.peran === "Mahasiswa" && !POLA_KAMPUS.test(email)) {
            throw new Error("Mahasiswa wajib memakai email kampus (.ac.id atau .edu).");
        }

        let hashBaru = null;

        if (sandiBaru) {
            if (sandiBaru.length < 6) {
                throw new Error("Kata sandi baru minimal 6 karakter.");
            }

            if (sandiBaru !== ulang) {
                throw new Error("Konfirmasi kata sandi baru tidak sama.");
            }

            const { rows } = await pool.query(
                "SELECT kata_sandi_hash FROM pengguna WHERE id = $1",
                [sesi.id]
            );

            const cocok = await bcrypt.compare(
                sandiLama,
                rows[0].kata_sandi_hash
            );

            if (!cocok) {
                throw new Error("Kata sandi lama salah.");
            }

            hashBaru = await bcrypt.hash(sandiBaru, 10);
        }

        let fotoBuf = null;
        let fotoTipe = null;

        if (foto && typeof foto === "object" && foto.size > 0) {
            if (!TIPE_FOTO.includes(foto.type)) {
                throw new Error("Foto harus berformat JPG, PNG, atau WEBP.");
            }

            if (foto.size > BATAS_FOTO) {
                throw new Error("Ukuran foto maksimal 2 MB.");
            }

            fotoBuf = Buffer.from(await foto.arrayBuffer());
            fotoTipe = foto.type;
        }

        const hasil = await pool.query(
            `UPDATE pengguna
             SET nama_lengkap = $1,
                 email = $2,
                 kata_sandi_hash = COALESCE($3, kata_sandi_hash),
                 foto = CASE
                     WHEN $4::boolean THEN NULL
                     WHEN $5::bytea IS NOT NULL THEN $5::bytea
                     ELSE foto
                 END,
                 foto_tipe = CASE
                     WHEN $4::boolean THEN NULL
                     WHEN $5::bytea IS NOT NULL THEN $6::text
                     ELSE foto_tipe
                 END
             WHERE id = $7
             RETURNING id, nama_lengkap, peran`,
            [nama, email, hashBaru, hapusFoto, fotoBuf, fotoTipe, sesi.id]
        );

        await buatSesi(hasil.rows[0]);
    });
}