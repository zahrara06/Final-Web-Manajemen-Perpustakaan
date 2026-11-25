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

    const { rows } = await pool.query("SELECT * FROM buku WHERE id = $1", [id]);
    const buku = rows[0];
    if (!buku) notFound();

    const kategori = await pool.query(
        "SELECT id, nama FROM kategori ORDER BY nama"
    );

    return (
        <>
            <header className="anim-naik grid gap-2">
                <nav className="text-sm font-bold">
                    <Link href="/kelola/buku" className="text-biru underline">
                        Kelola Buku
                    </Link>
                    <span className="mx-2 opacity-60">/</span>
                    <span>Ubah Buku #{buku.id}</span>
                </nav>

                <h1 className="text-[clamp(1.8rem,3.4vw,2.8rem)]">
                    {buku.judul}
                </h1>

                <p className="max-w-[60ch] opacity-80">
                    ISBN {buku.isbn}. ISBN tidak dapat diubah setelah buku
                    ditambahkan.
                </p>
            </header>

            <BookForm
                aksi={ubahBuku}
                daftarKategori={kategori.rows}
                buku={buku}
            />
        </>
    );
}