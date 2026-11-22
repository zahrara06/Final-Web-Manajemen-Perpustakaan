import Field from "@/components/Field";

export default function BookForm({
    aksi,
    daftarKategori,
    buku = {},
    untukBaru = false,
}) {
    return (
        <form action={aksi} className="grid gap-4 md:grid-cols-2">
            {buku.id && (
                <input
                    type="hidden"
                    name="id"
                    value={buku.id}
                />
            )}

            <Field
                label="Judul buku"
                nama="judul"
                nilai={buku.judul}
            />

            {untukBaru && (
                <Field
                    label="ISBN"
                    nama="isbn"
                />
            )}

            <Field
                label="Penulis"
                nama="penulis"
                nilai={buku.penulis}
            />

            <Field
                label="Penerbit"
                nama="penerbit"
                nilai={buku.penerbit}
            />

            <Field
                label="Tahun terbit"
                nama="tahun_terbit"
                tipe="number"
                min={1000}
                nilai={buku.tahun_terbit}
            />

            <Field
                label="Kategori"
                nama="kategori_id"
                tipe="select"
                nilai={buku.kategori_id}
            >
                {daftarKategori.map((kategori) => (
                    <option key={kategori.id} value={kategori.id}>
                        {kategori.nama}
                    </option>
                ))}
            </Field>

            <Field
                label="Jumlah stok"
                nama="stok_total"
                tipe="number"
                min={0}
                nilai={buku.stok_total ?? 1}
            />

            <Field
                label="Maksimal pinjam (hari)"
                nama="durasi_pinjam_hari"
                tipe="number"
                min={1}
                nilai={buku.durasi_pinjam_hari ?? 7}
            />

            <Field
                label="Denda per hari (Rp)"
                nama="denda_per_hari"
                tipe="number"
                min={0}
                nilai={buku.denda_per_hari ?? 1000}
            />

            <Field
                label="Tautan gambar sampul (opsional)"
                nama="gambar_sampul"
                nilai={buku.gambar_sampul}
                wajib={false}
            />

            <button className="col-span-full inline-block cursor-pointer rounded-xl border-[2.5px] border-biru-tua bg-kuning px-5 py-2.5 text-center font-bold text-biru-tua shadow-tombol transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55">
                {untukBaru ? "Tambah buku" : "Simpan perubahan"}
            </button>
        </form>
    );
}