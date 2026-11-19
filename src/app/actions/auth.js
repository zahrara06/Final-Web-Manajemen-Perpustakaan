"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { buatSesi, hapusSesi } from "@/lib/auth";
import { keluar } from "@/lib/util";

export async function register(formData) {
    const nama = String(formData.get("nama") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const nim = String(formData.get("nomor_identitas") || "").trim();
    const password = String(formData.get("password") || "");

    if (!nama || !email || !nim || !password) {
        keluar("/register", "error", "Semua data wajib diisi.");
    }

    if (!/^[^\s@]+@[^\s@]+\.ac\.id$/.test(email)) {
        keluar("/register", "error", "Gunakan email kampus (berakhiran .ac.id).");
    }

    if (password.length < 6) {
        keluar("/register", "error", "Password minimal 6 karakter.");
    }

    const hash = await bcrypt.hash(password, 10);

    try {
        await pool.query(
            "INSERT INTO users (nama, email, password, role, nomor_identitas) VALUES ($1,$2,$3,'mahasiswa',$4)",
            [nama, email, hash, nim]
        );
    } catch (e) {
        if (e.code === "23505") {
            keluar("/register", "error", "Email atau NIM sudah terdaftar.");
        }

        throw e;
    }

    keluar("/login", "ok", "Registrasi berhasil, silakan masuk.");
}

export async function login(formData) {
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
        keluar("/login", "error", "Email dan password wajib diisi.");
    }

    const { rows } = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
        keluar("/login", "error", "Email atau password salah.");
    }

    if (!user.aktif) {
        keluar("/login", "error", "Akun Anda dinonaktifkan.");
    }

    await buatSesi(user);

    redirect("/" + user.role);
}

export async function logout() {
    await hapusSesi();
    redirect("/");
}