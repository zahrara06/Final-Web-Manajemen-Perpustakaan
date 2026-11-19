import Field from "./Field";

export default function UserForm({ action, user }) {
    const dataUser = user || {};

    return (
        <form action={action} className="grid sm:grid-cols-2 gap-3 mt-3">

            {dataUser.id && (
                <input type="hidden" name="id" value={dataUser.id} />
            )}

            <Field
                label="Nama lengkap"
                name="nama"
                defaultValue={dataUser.nama}
            />

            <Field
                label="Email"
                name="email"
                type="email"
                defaultValue={dataUser.email}
            />

            {!dataUser.id && (
                <Field
                    label="Password (min. 6 karakter)"
                    name="password"
                    type="password"
                    minLength={6}
                />
            )}

            {!dataUser.id && (
                <Field
                    label="Nomor identitas / NIM"
                    name="nomor_identitas"
                />
            )}

            <label className="block text-sm">
                <span className="text-slate-600">Role</span>
                <select
                    name="role"
                    defaultValue={dataUser.role || "mahasiswa"}
                    className="inp mt-1"
                >
                    <option value="admin">Admin</option>
                    <option value="pegawai">Pegawai</option>
                    <option value="mahasiswa">Mahasiswa</option>
                </select>
            </label>

            {dataUser.id && (
                <label className="flex items-center gap-2 text-sm sm:mt-6">
                    <input
                        type="checkbox"
                        name="aktif"
                        defaultChecked={dataUser.aktif}
                    />
                    Akun aktif
                </label>
            )}

            <div className="sm:col-span-2">
                <button className="btn">Simpan</button>
            </div>

        </form>
    );
}
