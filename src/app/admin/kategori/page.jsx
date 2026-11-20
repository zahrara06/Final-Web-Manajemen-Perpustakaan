import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Pesan from "@/components/Pesan";
import TombolHapus from "@/components/TombolHapus";
import FormKategori from "@/components/FormKategori";
import { simpanKategori, ubahKategori, hapusKategori } from "@/app/actions/categories";

export const dynamic = "force-dynamic";

export default async function KategoriPage({ searchParams }) {
    await requireRole("admin");

    const sp = await searchParams;

    const daftar = (
        await pool.query(
            `SELECT c.*, COUNT(b.id)::int AS jml_buku
             FROM categories c
             LEFT JOIN books b ON b.category_id = c.id
             GROUP BY c.id
             ORDER BY c.nama`
        )
    ).rows;

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-purple-900">
                Manajemen Kategori
            </h1>

            <Pesan sp={sp} />

            <details className="card">
                <summary className="cursor-pointer font-semibold text-purple-600">
                    + Tambah Kategori
                </summary>

                <FormKategori action={simpanKategori} />
            </details>

            <div className="card overflow-x-auto">
                <table className="tbl">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Kode</th>
                            <th>Deskripsi</th>
                            <th>Jml Buku</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {daftar.map((k) => (
                            <tr key={k.id}>
                                <td>{k.nama}</td>
                                <td>{k.kode}</td>
                                <td>{k.deskripsi}</td>
                                <td>{k.jml_buku}</td>

                                <td>
                                    <details>
                                        <summary className="cursor-pointer text-purple-600 text-sm">
                                            Edit
                                        </summary>

                                        <FormKategori
                                            action={ubahKategori}
                                            k={k}
                                        />
                                    </details>

                                    <div className="mt-2">
                                        <TombolHapus
                                            action={hapusKategori}
                                            id={k.id}
                                            pesan="Hapus kategori ini?"
                                        />
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
