import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import Pesan from "@/components/Pesan";
import FormProfil from "@/components/FormProfil";

export default async function Profil({ searchParams }) {
    const sesi = await wajibPeran("Admin", "Pegawai", "Mahasiswa");
    const sp = await searchParams;

    const { rows } = await pool.query(
        `SELECT id, nama_lengkap, email, peran, nomor_identitas,
                foto IS NOT NULL AS ada_foto
         FROM pengguna
         WHERE id = $1`,
        [sesi.id]
    );

    return (
        <>
            <Pesan sp={sp} />
            <FormProfil pengguna={rows[0]} />
        </>
    );
}