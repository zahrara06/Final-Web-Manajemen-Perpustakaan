import Field from "./Field";
import { tglInput } from "@/lib/util";

export default function AnnouncementForm({ action, p }) {
    const pengumuman = p || {};

    return (
        <form action={action} className="grid sm:grid-cols-3 gap-3 mt-3">

            {pengumuman.id && (
                <input
                    type="hidden"
                    name="id"
                    value={pengumuman.id}
                />
            )}

            <div className="sm:col-span-3">
                <Field
                    label="Judul pengumuman"
                    name="judul"
                    defaultValue={pengumuman.judul}
                />
            </div>

            <label className="block text-sm sm:col-span-3">
                <span className="text-slate-600">Isi konten</span>
                <textarea
                    name="konten"
                    rows={4}
                    required
                    defaultValue={pengumuman.konten}
                    className="inp mt-1"
                />
            </label>

            <label className="block text-sm">
                <span className="text-slate-600">Kategori</span>
                <select
                    name="kategori"
                    defaultValue={pengumuman.kategori || "Operasional"}
                    className="inp mt-1"
                >
                    <option>Operasional</option>
                    <option>Layanan</option>
                    <option>Acara</option>
                </select>
            </label>

            <Field
                label="Tanggal rilis"
                name="tanggal_rilis"
                type="date"
                defaultValue={
                    tglInput(pengumuman.tanggal_rilis) || tglInput(new Date())
                }
            />

            <label className="block text-sm">
                <span className="text-slate-600">Status publikasi</span>
                <select
                    name="status"
                    defaultValue={pengumuman.status || "Draft"}
                    className="inp mt-1"
                >
                    <option>Draft</option>
                    <option>Published</option>
                </select>
            </label>

            <div className="sm:col-span-3">
                <button className="btn">Simpan</button>
            </div>

        </form>
    );
}
