import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { ubahBuku } from "@/app/actions/books";
import BookForm from "@/components/BookForm";

export default async function UbahBuku({ params }) {
    await wajibPeran("Pegawai", "Admin");

    const { id } = await params;
    if (!/^\d+$/.test(id)) notFound();

    const { rows } = await pool.query(
        "SELECT * FROM buku WHERE id = $1",
        [id]
    );
    const buku = rows[0];
    if (!buku) notFound();

    const kategori = await pool.query(
        "SELECT id, nama FROM kategori ORDER BY nama"
    );

    return (
        <section className="block border-[2.5px] border-biru-tua rounded-[18px] shadow-keras p-5 bg-white max-w-[760px]">
            <h1 className="text-[2rem] mb-4">Ubah Buku #{buku.id}</h1>

            <BookForm
                aksi={ubahBuku}
                daftarKategori={kategori.rows}
                buku={buku}
            />

            <p className="mt-4">
                <Link href="/kelola/buku" className="font-bold text-biru underline">
                Batal dan kembali
                </Link>
            </p>
        </section>
    );
}