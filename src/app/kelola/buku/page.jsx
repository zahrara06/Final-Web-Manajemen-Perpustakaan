import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Pesan from "@/components/Pesan";
import DeleteButton from "@/components/DeleteButton";
import { hapusBuku } from "@/app/actions/books";

export const dynamic = "force-dynamic";

export default async function KelolaBukuPage({ searchParams }) {
    await requireRole("pegawai", "admin");
    const sp = await searchParams;

    const buku = (await pool.query(
        `SELECT b.id, b.judul, b.isbn, b.pengarang, b.stok_total, b.stok_tersedia, c.nama AS kategori
         FROM books b JOIN categories c ON c.id=b.category_id
         ORDER BY b.id DESC`
    )).rows;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-purple-900">Kelola Buku</h1>
                <Link href="/kelola/buku/baru" className="btn">+ Tambah Buku</Link>
            </div>

            <Pesan sp={sp} />

            <div className="card overflow-x-auto">
                <table className="tbl">
                    <thead>
                        <tr>
                            <th>Judul</th>
                            <th>ISBN</th>
                            <th>Pengarang</th>
                            <th>Kategori</th>
                            <th>Stok Total</th>
                            <th>Tersedia</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buku.map((b) => (
                            <tr key={b.id}>
                                <td>{b.judul}</td>
                                <td>{b.isbn}</td>
                                <td>{b.pengarang}</td>
                                <td>{b.kategori}</td>
                                <td>{b.stok_total}</td>
                                <td>{b.stok_tersedia}</td>
                                <td>
                                    <div className="flex gap-3">
                                        <Link href={`/kelola/buku/${b.id}`} className="text-purple-600 hover:underline text-sm">Edit</Link>
                                        <DeleteButton action={hapusBuku} id={b.id} pesan="Yakin hapus buku ini?" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}