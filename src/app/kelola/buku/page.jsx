import Link from "next/link";
import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { hapusBuku } from "@/app/actions/books";
import TombolHapus from "@/components/TombolHapus";
import Pesan from "@/components/Pesan";
import { TOMBOL_EDIT, TOMBOL_UTAMA } from "@/components/gayaTombol";

const KELAS_TABEL =
    "w-full border-separate border-spacing-0 overflow-hidden rounded-[14px] border-[2.5px] border-biru-tua bg-white shadow-keras [&_th]:bg-biru-tua [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-sm [&_th]:text-white [&_td]:border-t [&_td]:border-biru-muda [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:align-middle [&_td]:text-[0.92rem] [&_td_form]:inline-flex [&_td_form]:items-center [&_td_form]:gap-1.5";

export default async function KelolaBuku({ searchParams }) {
    await wajibPeran("Pegawai", "Admin");

    const { rows: daftarBuku } = await pool.query(
        `SELECT b.id,
                b.judul,
                b.penulis,
                b.stok_total,
                b.stok_tersedia,
                k.nama AS nama_kategori
        FROM buku b
        JOIN kategori k ON k.id = b.kategori_id
        ORDER BY b.id DESC`
    );

    const sp = await searchParams;

    return (
        <>
            <div className="flex items-baseline justify-between gap-4 mb-5">
                <h1>Kelola Buku</h1>
                <Link href="/kelola/buku/baru" className={TOMBOL_UTAMA}>
                    + Tambah Buku
                </Link>
            </div>

            <Pesan sp={sp} />

            <div className="overflow-x-auto">
                <table className={KELAS_TABEL}>
                    <thead>
                        <tr>
                            <th>Judul</th>
                            <th>Penulis</th>
                            <th>Kategori</th>
                            <th>Stok (tersedia/total)</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {daftarBuku.map((b) => (
                            <tr key={b.id}>
                                <td>{b.judul}</td>
                                <td>{b.penulis}</td>
                                <td>{b.nama_kategori}</td>
                                <td>
                                    {b.stok_tersedia} / {b.stok_total}
                                </td>
                                <td>
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <Link
                                            href={`/kelola/buku/${b.id}`}
                                            className={TOMBOL_EDIT}
                                        >
                                            ✎ Edit
                                        </Link>
                                        <TombolHapus
                                            aksi={hapusBuku}
                                            id={b.id}
                                            pesan={`Hapus buku "${b.judul}"?`}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {daftarBuku.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-5 text-center opacity-70">
                                    Belum ada buku.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}