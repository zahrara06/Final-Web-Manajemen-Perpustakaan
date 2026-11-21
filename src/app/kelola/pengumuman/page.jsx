import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Pesan from "@/components/Pesan";
import TombolHapus from "@/components/TombolHapus";
import FormPengumuman from "@/components/FormPengumuman";
import {
    simpanPengumuman,
    ubahPengumuman,
    hapusPengumuman,
} from "@/app/actions/announcements";
import { tgl } from "@/lib/util";

export const dynamic = "force-dynamic";

export default async function KelolaPengumumanPage({ searchParams }) {
    await requireRole("pegawai", "admin");

    const sp = await searchParams;
    const daftar = (
        await pool.query(
            "SELECT * FROM announcements ORDER BY tanggal_rilis DESC, id DESC"
        )
    ).rows;

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-purple-900">
                Kelola Pengumuman
            </h1>

            <Pesan sp={sp} />

            <details className="card">
                <summary className="cursor-pointer font-semibold text-purple-600">
                    + Tambah Pengumuman
                </summary>

                <FormPengumuman action={simpanPengumuman} />
            </details>

            {daftar.map((a) => (
                <div key={a.id} className="card">
                    <div className="flex flex-wrap justify-between gap-2">
                        <div>
                            <p className="text-xs text-slate-500">
                                {a.kategori} • {tgl(a.tanggal_rilis)} •{" "}
                                <b>{a.status}</b>
                            </p>

                            <h3 className="font-semibold">{a.judul}</h3>
                        </div>

                        <TombolHapus
                            action={hapusPengumuman}
                            id={a.id}
                            pesan="Hapus pengumuman ini?"
                        />
                    </div>

                    <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-purple-600">
                            Edit
                        </summary>

                        <FormPengumuman action={ubahPengumuman} p={a} />
                    </details>
                </div>
            ))}
        </div>
    );
}