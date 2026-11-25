import Link from "next/link";
import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { formatTanggal } from "@/lib/util";
import { tambahPengumuman, ubahPengumuman, hapusPengumuman } from "@/app/actions/announcements";
import AnnouncementForm from "@/components/AnnouncementForm";
import Badge from "@/components/Badge";
import TombolHapus from "@/components/TombolHapus";
import Pesan from "@/components/Pesan";
import { TOMBOL_EDIT, TOMBOL_BATAL } from "@/components/gayaTombol";

export default async function KelolaPengumuman({ searchParams }) {
    await wajibPeran("Pegawai", "Admin");
    const sp = await searchParams;
    const { rows } = await pool.query("SELECT * FROM pengumuman ORDER BY tanggal_rilis DESC, id DESC");
    const diedit = rows.find((p) => String(p.id) === sp.edit);

    return (
        <>
        <h1>Kelola Pengumuman</h1>
        <Pesan sp={sp} />

        <section className="block border-[2.5px] border-biru-tua rounded-[18px] shadow-keras p-5 bg-white">
            <h2 className="mb-4">{diedit ? `Ubah Pengumuman #${diedit.id}` : "Tambah Pengumuman"}</h2>
            <AnnouncementForm key={diedit?.id ?? "baru"} aksi={diedit ? ubahPengumuman : tambahPengumuman} pengumuman={diedit} />
            {diedit && (
                <p className="mt-4">
                    <Link href="/kelola/pengumuman" className={TOMBOL_BATAL}>
                        Batal mengubah
                    </Link>
                </p>
            )}
        </section>

        <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-[14px] 
                border-[2.5px] border-biru-tua bg-white shadow-keras [&_th]:bg-biru-tua [&_th]:px-3.5 [&_th]:py-2.5 
                [&_th]:text-left [&_th]:text-sm [&_th]:text-white [&_td]:border-t [&_td]:border-biru-muda [&_td]:px-3.5 [&_td]:py-2.5 
                [&_td]:align-middle [&_td]:text-[0.92rem] [&_td_form]:inline-flex [&_td_form]:items-center [&_td_form]:gap-1.5">
                <thead>
                    <tr>
                        <th>Judul</th>
                        <th>Kategori</th>
                        <th>Tanggal rilis</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map((p) => (
                    <tr key={p.id}>
                        <td>{p.judul}</td>
                        <td>{p.kategori}</td>
                        <td>{formatTanggal(p.tanggal_rilis)}</td>
                        <td><Badge warna={p.status === "Published" ? "biru" : ""}>{p.status}</Badge></td>
                        <td>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <Link href={`/kelola/pengumuman?edit=${p.id}`} className={TOMBOL_EDIT}>
                                ✎ Edit
                            </Link>
                            <TombolHapus aksi={hapusPengumuman} id={p.id} pesan={`Hapus pengumuman "${p.judul}"?`} />
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