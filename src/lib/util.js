import "server-only";
import { redirect } from "next/navigation";

export const rupiah = (angka) =>
    "Rp " + Number(angka || 0).toLocaleString("id-ID");

export const formatTanggal = (teks) =>
    teks
        ? String(teks).slice(0, 10).split("-").reverse().join("/")
        : "-";

export const hariIni = () =>
    new Date().toLocaleDateString("sv-SE");

export const ambilTeks = (formData, nama) =>
    String(formData.get(nama) ?? "").trim();

export const ambilAngka = (formData, nama) =>
    Number(formData.get(nama));

export function pesanError(error) {
    if (error.code === "23505") {
        return "Data gagal disimpan: ada nilai unik (email, ISBN, kode, atau nomor identitas) yang sudah dipakai.";
    }

    if (error.code === "23503") {
        return "Data tidak valid atau masih terhubung dengan data lain.";
    }

    if (error.code === "23514") {
        return "Ada nilai yang tidak memenuhi aturan (misalnya stok negatif).";
    }

    return error.message;
}

export function alihkan(jalur, pesan, jenis = "sukses") {
    const pemisah = jalur.includes("?") ? "&" : "?";

    redirect(
        `${jalur}${pemisah}pesan=${encodeURIComponent(pesan)}&jenis=${jenis}`
    );
}

export async function jalankan(jalurTujuan, pesanSukses, fungsiAksi) {
    let pesan = pesanSukses;
    let jenis = "sukses";

    try {
        await fungsiAksi();
    } catch (error) {
        pesan = pesanError(error);
        jenis = "error";
    }

    alihkan(jalurTujuan, pesan, jenis);
}
