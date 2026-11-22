import Field from "@/components/Field";

const DAFTAR_PERAN = ["Mahasiswa", "Pegawai", "Admin"];

export default function UserForm({ aksi, pengguna = {}, untukBaru = false }) {
  return (
    <form action={aksi} className="grid gap-4 md:grid-cols-2">
        {pengguna.id && (
            <input type="hidden" name="id" value={pengguna.id} />
        )}

        <Field
            label="Nama lengkap"
            nama="nama_lengkap"
            nilai={pengguna.nama_lengkap}
        />

        <Field
            label="Email"
            nama="email"
            tipe="email"
            nilai={pengguna.email}
        />

        {untukBaru && (
            <Field
            label="Kata sandi"
            nama="kata_sandi"
            tipe="password"
            />
        )}

        <Field
            label="Peran"
            nama="peran"
            tipe="select"
            nilai={pengguna.peran}
        >
            {DAFTAR_PERAN.map((p) => (
            <option key={p}>{p}</option>
            ))}
        </Field>

        {untukBaru ? (
            <Field
            label="Nomor identitas / NIM"
            nama="nomor_identitas"
            />
        
        ) : (
            <Field
            label="Status akun"
            nama="aktif"
            tipe="select"
            nilai={pengguna.aktif}
            >
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
            </Field>
        )}

            <button className="inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-5 py-2.5 shadow-tombol bg-kuning col-span-full">
                {untukBaru ? "Tambah pengguna" : "Simpan perubahan"}
            </button>
        </form>
    );
}