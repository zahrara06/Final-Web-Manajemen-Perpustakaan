import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import FormBuku from "@/components/FormBuku";
import Pesan from "@/components/Pesan";
import { simpanBuku } from "@/app/actions/books";

export default async function BukuBaruPage({ searchParams }) {
    await requireRole("pegawai", "admin");

    const sp = await searchParams;
    const kategori = (
        await pool.query(
            "SELECT id, nama FROM categories ORDER BY nama"
        )
    ).rows;

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-purple-900 mb-4">
                Tambah Buku
            </h1>

            <Pesan sp={sp} />

            <FormBuku action={simpanBuku} kategori={kategori} />
        </div>
    );
}