import Link from "next/link";
import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { tambahBuku } from "@/app/actions/books";
import BookForm from "@/components/BookForm";

export default async function TambahBuku() {
    await wajibPeran("Pegawai", "Admin");

    const { rows: daftarKategori } = await pool.query(
        "SELECT id, nama FROM kategori ORDER BY nama"
    );

    return (
        <section className="block border-[2.5px] border-biru-tua rounded-[18px] shadow-keras p-5 bg-white max-w-[760px]">
            <h1 className="text-[2rem] mb-4">Tambah Buku</h1>

            <BookForm
                aksi={tambahBuku}
                daftarKategori={daftarKategori}
                untukBaru
            />

            <p className="mt-4">
                <Link href="/kelola/buku" className="font-bold text-biru underline">
                Batal dan kembali
                </Link>
            </p>
        </section>
    );
}