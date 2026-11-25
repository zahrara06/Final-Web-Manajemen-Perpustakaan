import Link from "next/link";
import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { tambahPengguna, ubahPengguna, hapusPengguna } from "@/app/actions/users";
import UserForm from "@/components/UserForm";
import TombolHapus from "@/components/TombolHapus";
import Pesan from "@/components/Pesan";
import { TOMBOL_EDIT, TOMBOL_BATAL } from "@/components/gayaTombol";

export default async function KelolaPengguna({ searchParams }) {
    const sesi = await wajibPeran("Admin");
    const sp = await searchParams;

    const peran = ["Admin", "Pegawai", "Mahasiswa"].includes(sp.peran)
        ? sp.peran
        : "";

    const { rows: pengguna } = await pool.query(
        `SELECT
            id,
            nama_lengkap,
            email,
            peran,
            nomor_identitas,
            aktif
         FROM pengguna
         WHERE ($1::text = '' OR peran = $1)
         ORDER BY id`,
        [peran]
    );

    const penggunaDiedit = pengguna.find(
        (item) => String(item.id) === sp.edit
    );

    return (
        <>
            <h1>Kelola Pengguna</h1>

            <Pesan sp={sp} />

            <section className="block rounded-[18px] border-[2.5px] border-biru-tua bg-white p-5 shadow-keras">
                <h2 className="mb-4">
                    {penggunaDiedit
                        ? `Ubah Pengguna #${penggunaDiedit.id}`
                        : "Tambah Pengguna"}
                </h2>

                <UserForm
                    key={penggunaDiedit?.id ?? "baru"}
                    aksi={penggunaDiedit ? ubahPengguna : tambahPengguna}
                    pengguna={penggunaDiedit}
                    untukBaru={!penggunaDiedit}
                />

                {penggunaDiedit && (
                    <p className="mt-4">
                        <Link href="/admin/users" className={TOMBOL_BATAL}>
                            Batal mengubah
                        </Link>
                    </p>
                )}
            </section>

            <form className="flex flex-wrap items-center gap-3 [&_input]:w-auto [&_input]:min-w-[150px] [&_input]:flex-1 [&_select]:w-auto [&_select]:min-w-[150px] [&_select]:flex-1">
                <select
                    name="peran"
                    defaultValue={peran}
                    aria-label="Filter peran"
                >
                    <option value="">Semua peran</option>
                    <option>Admin</option>
                    <option>Pegawai</option>
                    <option>Mahasiswa</option>
                </select>

                <button className="inline-block cursor-pointer rounded-xl border-[2.5px] border-biru-tua bg-kuning px-5 py-2.5 text-center font-bold text-biru-tua shadow-tombol transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55">
                    Terapkan filter
                </button>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full overflow-hidden rounded-[14px] border-separate border-spacing-0 border-[2.5px] border-biru-tua bg-white shadow-keras [&_th]:bg-biru-tua [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-sm [&_th]:text-white [&_td]:border-t [&_td]:border-biru-muda [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:align-middle [&_td]:text-[0.92rem] [&_td_form]:inline-flex [&_td_form]:items-center [&_td_form]:gap-1.5">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>Peran</th>
                            <th>Nomor Identitas</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pengguna.map((item) => (
                            <tr key={item.id}>
                                <td>{item.nama_lengkap}</td>
                                <td>{item.email}</td>
                                <td>{item.peran}</td>
                                <td>{item.nomor_identitas}</td>
                                <td>
                                    {item.aktif ? "Aktif" : "Nonaktif"}
                                </td>
                                <td>
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <Link href={`/admin/users?edit=${item.id}`} className={TOMBOL_EDIT}>
                                            ✎ Edit
                                        </Link>

                                        {item.id !== sesi.id && (
                                            <TombolHapus
                                                aksi={hapusPengguna}
                                                id={item.id}
                                                pesan={`Hapus akun ${item.nama_lengkap}?`}
                                            />
                                        )}
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