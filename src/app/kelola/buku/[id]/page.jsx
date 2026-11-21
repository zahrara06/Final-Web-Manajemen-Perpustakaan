import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import FormBuku from "@/components/FormBuku";
import Pesan from "@/components/Pesan";
import { ubahBuku } from "@/app/actions/books";

export const dynamic = "force-dynamic";

export default async function EditBukuPage({ params, searchParams }) {
    await requireRole("pegawai", "admin");

    const { id } = await params;
    const sp = await searchParams;

    if (!Number.isInteger(Number(id))) notFound();

    const {
        rows: [buku],
    } = await pool.query("SELECT * FROM books WHERE id=$1", [id]);

    if (!buku) notFound();

    const kategori = (
        await pool.query(
            "SELECT id, nama FROM categories ORDER BY nama"
        )
    ).rows;

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-purple-900 mb-4">
                Edit Buku #{buku.id}
            </h1>

            <Pesan sp={sp} />

            <FormBuku
                action={ubahBuku}
                buku={buku}
                kategori={kategori}
            />
        </div>
    );
}