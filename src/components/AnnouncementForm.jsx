import Field from "@/components/Field";
import { hariIni } from "@/lib/util";

export default function AnnouncementForm({ aksi, pengumuman = {} }) {
    return (
        <form action={aksi} className="grid gap-4 md:grid-cols-2">
            {pengumuman.id && (
                <input
                    type="hidden"
                    name="id"
                    value={pengumuman.id}
                />
            )}

            <Field
                label="Judul pengumuman"
                nama="judul"
                nilai={pengumuman.judul}
            />

            <Field
                label="Kategori"
                nama="kategori"
                tipe="select"
                nilai={pengumuman.kategori}
            >
                {["Operasional", "Layanan", "Acara"].map((kategori) => (
                    <option key={kategori}>{kategori}</option>
                ))}
            </Field>

            <Field
                label="Tanggal rilis"
                nama="tanggal_rilis"
                tipe="date"
                nilai={pengumuman.tanggal_rilis ?? hariIni()}
            />

            <Field
                label="Status publikasi"
                nama="status"
                tipe="select"
                nilai={pengumuman.status ?? "Draft"}
            >
                <option>Draft</option>
                <option>Published</option>
            </Field>

            <Field
                label="Isi pengumuman"
                nama="isi"
                tipe="textarea"
                nilai={pengumuman.isi}
            />

            <button className="col-span-full inline-block cursor-pointer rounded-xl border-[2.5px] border-biru-tua bg-kuning px-5 py-2.5 text-center font-bold text-biru-tua shadow-tombol transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55">
                {pengumuman.id ? "Simpan perubahan" : "Tambah pengumuman"}
            </button>
        </form>
    );
}