"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { buatSesi, hapusSesi } from "@/lib/auth";
import { ambilTeks, alihkan } from "@/lib/util";

const POLA_EMAIL_KAMPUS = /^[^\s@]+@([a-z0-9-]+\.)*(ac\.id|edu)$/i;
const BERANDA_PERAN = {
    Admin: "/admin",
    Pegawai: "/pegawai",
    Mahasiswa: "/mahasiswa",
};

export async function masuk(formData) {
    const email = ambilTeks(formData, "email").toLowerCase();
    const kataSandi = String(formData.get("kata_sandi") ?? "");
    const dari = ambilTeks(formData, "dari");
    const jalurMasuk = dari
        ? `/login?dari=${encodeURIComponent(dari)}`
        : "/login";

    if (!email || !kataSandi) {
        alihkan(jalurMasuk, "Email dan kata sandi wajib diisi.", "error");
    }

    const { rows } = await pool.query(
        "SELECT * FROM pengguna WHERE email = $1",
        [email]
    );
    const pengguna = rows[0];
    const cocok =
        pengguna && (await bcrypt.compare(kataSandi, pengguna.kata_sandi_hash));

    if (!cocok) {
        alihkan(jalurMasuk, "Email atau kata sandi salah.", "error");
    }

    if (!pengguna.aktif) {
        alihkan(
        jalurMasuk,
        "Akun ini dinonaktifkan. Hubungi admin perpustakaan.",
        "error"
        );
    }

    await buatSesi(pengguna);
    const dariAman = dari.startsWith("/") && !dari.startsWith("//");
    redirect(dariAman ? dari : BERANDA_PERAN[pengguna.peran]);
}

export async function daftar(formData) {
    const namaLengkap = ambilTeks(formData, "nama_lengkap");
    const email = ambilTeks(formData, "email").toLowerCase();
    const nomorIdentitas = ambilTeks(formData, "nomor_identitas");
    const kataSandi = String(formData.get("kata_sandi") ?? "");

    if (!namaLengkap || !email || !nomorIdentitas || !kataSandi) {
        alihkan("/register", "Semua data wajib diisi.", "error");
    }

    if (!POLA_EMAIL_KAMPUS.test(email)) {
        alihkan(
        "/register",
        "Gunakan email kampus (berakhiran .ac.id atau .edu).",
        "error"
        );
    }

    if (kataSandi.length < 6) {
        alihkan("/register", "Kata sandi minimal 6 karakter.", "error");
    }

    let pengguna;
    try {
        const hash = await bcrypt.hash(kataSandi, 10);
        const hasil = await pool.query(
        `INSERT INTO pengguna (nama_lengkap, email, kata_sandi_hash, peran, nomor_identitas)
        VALUES ($1, $2, $3, 'Mahasiswa', $4) RETURNING *`,
        [namaLengkap, email, hash, nomorIdentitas]
        );
        pengguna = hasil.rows[0];
    } catch (error) {
        if (error.code === "23505") {
        alihkan("/register", "Email atau NIM sudah terdaftar.", "error");
        }
        throw error;
    }

    await buatSesi(pengguna);
    redirect("/mahasiswa");
}

export async function keluar() {
    await hapusSesi();
    redirect("/");
}