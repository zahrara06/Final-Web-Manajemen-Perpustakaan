"use server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { keluar } from "@/lib/util";

const ROLE = ["admin", "pegawai", "mahasiswa"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const P = "/admin/users";

export async function simpanUser(formData) {
    await requireRole("admin");

    const nama = String(formData.get("nama") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const role = String(formData.get("role") || "");
    const nim = String(formData.get("nomor_identitas") || "").trim();

    if (!nama || !email || !password || !role || !nim) {
        keluar(P, "error", "Semua data wajib diisi.");
    }

    if (!EMAIL.test(email)) {
        keluar(P, "error", "Format email tidak valid.");
    }

    if (!ROLE.includes(role)) {
        keluar(P, "error", "Role tidak valid.");
    }

    if (password.length < 6) {
        keluar(P, "error", "Password minimal 6 karakter.");
    }

    try {
        await pool.query(
            `INSERT INTO users (nama, email, password, role, nomor_identitas)
             VALUES ($1, $2, $3, $4, $5)`,
            [nama, email, await bcrypt.hash(password, 10), role, nim]
        );
    } catch (e) {
        if (e.code === "23505") {
            keluar(P, "error", "Email atau nomor identitas sudah terdaftar.");
        }

        throw e;
    }

    keluar(P, "ok", "Pengguna ditambahkan.");
}

export async function ubahUser(formData) {
    const me = await requireRole("admin");

    const id = Number(formData.get("id"));
    const nama = String(formData.get("nama") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const role = String(formData.get("role") || "");
    const aktif = formData.get("aktif") === "on";

    if (!nama || !email || !role) {
        keluar(P, "error", "Data tidak boleh kosong.");
    }

    if (!EMAIL.test(email)) {
        keluar(P, "error", "Format email tidak valid.");
    }

    if (!ROLE.includes(role)) {
        keluar(P, "error", "Role tidak valid.");
    }

    if (id === me.id && (role !== "admin" || !aktif)) {
        keluar(P, "error", "Anda tidak dapat menurunkan/menonaktifkan akun sendiri.");
    }

    try {
        await pool.query(
            `UPDATE users
             SET nama = $1, email = $2, role = $3, aktif = $4
             WHERE id = $5`,
            [nama, email, role, aktif, id]
        );
    } catch (e) {
        if (e.code === "23505") {
            keluar(P, "error", "Email sudah dipakai pengguna lain.");
        }

        throw e;
    }

    keluar(P, "ok", "Pengguna diperbarui.");
}

export async function hapusUser(formData) {
    const me = await requireRole("admin");
    const id = Number(formData.get("id"));

    if (id === me.id) {
        keluar(P, "error", "Tidak dapat menghapus akun sendiri.");
    }

    const aktif = await pool.query(
        `SELECT 1
         FROM loans
         WHERE user_id = $1
         AND status IN ('menunggu', 'dipinjam')
         LIMIT 1`,
        [id]
    );

    if (aktif.rowCount > 0) {
        keluar(P, "error", "Pengguna masih memiliki transaksi aktif.");
    }

    await pool.query(
        "DELETE FROM users WHERE id = $1",
        [id]
    );

    keluar(P, "ok", "Pengguna dihapus.");
}
