import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Pesan from "@/components/Pesan";
import TombolHapus from "@/components/TombolHapus";
import FormUser from "@/components/FormUser";
import { simpanUser, ubahUser, hapusUser } from "@/app/actions/users";

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }) {
    const me = await requireRole("admin");
    const sp = await searchParams;

    const role = ["admin", "pegawai", "mahasiswa"].includes(sp.role)
        ? sp.role
        : "";

    const users = (
        await pool.query(
            `SELECT id, nama, email, role, nomor_identitas, aktif
             FROM users
             WHERE ($1::text = '' OR role = $1::text)
             ORDER BY id`,
            [role]
        )
    ).rows;

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-purple-900">
                Manajemen Pengguna
            </h1>

            <Pesan sp={sp} />

            <details className="card">
                <summary className="cursor-pointer font-semibold text-purple-600">
                    + Tambah Pengguna
                </summary>
                <FormUser action={simpanUser} />
            </details>

            <form className="flex gap-2 items-center">
                <select
                    name="role"
                    defaultValue={role}
                    className="inp sm:w-52"
                >
                    <option value="">Semua role</option>
                    <option value="admin">Admin</option>
                    <option value="pegawai">Pegawai</option>
                    <option value="mahasiswa">Mahasiswa</option>
                </select>

                <button className="btn">Filter</button>
            </form>

            <div className="card overflow-x-auto">
                <table className="tbl">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>No. Identitas</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.nama}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td>{u.nomor_identitas}</td>
                                <td>{u.aktif ? "Aktif" : "Nonaktif"}</td>

                                <td>
                                    <details>
                                        <summary className="cursor-pointer text-purple-600 text-sm">
                                            Edit
                                        </summary>

                                        <FormUser
                                            action={ubahUser}
                                            user={u}
                                        />
                                    </details>

                                    {u.id !== me.id && (
                                        <div className="mt-2">
                                            <TombolHapus
                                                action={hapusUser}
                                                id={u.id}
                                                pesan="Hapus akun ini?"
                                            />
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
