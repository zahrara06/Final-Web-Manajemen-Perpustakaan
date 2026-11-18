import Link from "next/link";
import Field from "./Field";

export default function BookForm({ action, buku, kategori }) {
    const b = buku || {};

    return (
        <form action={action} className="card grid sm:grid-cols-2 gap-3">

            {b.id && (
                <input type="hidden" name="id" value={b.id} />
            )}

            <Field label="Judul buku" name="judul" defaultValue={b.judul} />
            <Field label="ISBN" name="isbn" defaultValue={b.isbn} />
            <Field label="Pengarang" name="pengarang" defaultValue={b.pengarang} />
            <Field label="Penerbit" name="penerbit" defaultValue={b.penerbit} />

            <Field
                label="Tahun terbit"
                name="tahun_terbit"
                type="number"
                min="1000"
                max="2100"
                defaultValue={b.tahun_terbit}
            />

            <label className="block text-sm">
                <span className="text-slate-600">Kategori</span>

                <select
                    name="category_id"
                    required
                    defaultValue={b.category_id || ""}
                    className="inp mt-1"
                >
                    <option value="" disabled>Pilih kategori</option>

                    {kategori.map((k) => (
                        <option key={k.id} value={k.id}>
                            {k.nama}
                        </option>
                    ))}
                </select>
            </label>

            <Field label="Jumlah stok" name="stok_total" type="number" min="0" defaultValue={b.stok_total} />
            <Field label="Durasi maks. pinjam (hari)" name="durasi_maks" type="number" min="1" defaultValue={b.durasi_maks} />
            <Field label="Denda per hari (Rp)" name="denda_per_hari" type="number" min="0" defaultValue={b.denda_per_hari} />
            <Field label="Tautan gambar sampul" name="cover_url" type="url" required={false} defaultValue={b.cover_url} />

            <div className="sm:col-span-2 flex gap-2">
                <button className="btn">Simpan</button>
                <Link href="/kelola/buku" className="btn-sec">Batal</Link>
            </div>

        </form>
    );
}
