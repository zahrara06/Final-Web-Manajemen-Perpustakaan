import Link from "next/link";
import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import {tambahKategori, ubahKategori, hapusKategori} from "@/app/actions/categories";
import CategoryForm from "@/components/CategoryForm";
import TombolHapus from "@/components/TombolHapus";
import Pesan from "@/components/Pesan";
import { TOMBOL_EDIT, TOMBOL_BATAL } from "@/components/gayaTombol";

export default async function KelolaKategori({ searchParams }) {
    await wajibPeran("Admin");

    const sp = await searchParams;

    const { rows: kategori } = await pool.query(`
        SELECT
            k.*,
            COUNT(b.id) AS jumlah_buku
        FROM kategori k
        LEFT JOIN buku b ON b.kategori_id = k.id
        GROUP BY k.id
        ORDER BY k.nama
    `);

    const kategoriDiedit = kategori.find(
        (item) => String(item.id) === sp.edit
    );

    return (
        <>
            <h1>Kelola Kategori</h1>

            <Pesan sp={sp} />

            <section className="block rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 shadow-keras">
                <h2 className="mb-4">
                    {kategoriDiedit
                        ? `Ubah Kategori #${kategoriDiedit.id}`
                        : "Tambah Kategori"}
                </h2>

                <CategoryForm
                    key={kategoriDiedit?.id ?? "baru"}
                    aksi={kategoriDiedit ? ubahKategori : tambahKategori}
                    kategori={kategoriDiedit}
                />

                {kategoriDiedit && (
                    <p className="mt-4">
                        <Link href="/admin/kategori" className={TOMBOL_BATAL}>
                            Batal mengubah
                        </Link>
                    </p>
                )}
            </section>

            <div className="overflow-x-auto">
                <table className="w-full overflow-hidden rounded-[14px] border-separate border-spacing-0 border-[2.5px] border-biru-tua bg-white shadow-keras [&_th]:bg-biru-tua [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-sm [&_th]:text-white [&_td]:border-t [&_td]:border-biru-muda [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:align-middle [&_td]:text-[0.92rem] [&_td_form]:inline-flex [&_td_form]:items-center [&_td_form]:gap-1.5">
                    <thead>
                        <tr>
                            <th>Kode</th>
                            <th>Nama</th>
                            <th>Deskripsi</th>
                            <th>Jumlah Buku</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {kategori.map((item) => (
                            <tr key={item.id}>
                                <td>{item.kode}</td>
                                <td>{item.nama}</td>
                                <td>{item.deskripsi}</td>
                                <td>{item.jumlah_buku}</td>
                                <td>
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <Link href={`/admin/kategori?edit=${item.id}`} className={TOMBOL_EDIT}>
                                            ✎ Edit
                                        </Link>

                                        <TombolHapus
                                            aksi={hapusKategori}
                                            id={item.id}
                                            pesan={`Hapus kategori "${item.nama}"?`}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}