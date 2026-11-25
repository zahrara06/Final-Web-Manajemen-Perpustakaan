import Link from "next/link";
import Field from "@/components/Field";
import PilihSampul from "@/components/PilihSampul";
import { TOMBOL_UTAMA, TOMBOL_BATAL_BESAR} from "@/components/gayaTombol";

function Bagian({ nomor, judul, tunda, children }) {
    return (
        <section
            className="anim-naik grid gap-4"
            style={{ "--d": `${tunda}ms` }}
        >
            <h2 className="flex items-center gap-3 border-b-[2.5px] border-biru-tua pb-2 text-xl">
                <span className="grid size-8 place-items-center rounded-full border-2 border-biru-tua bg-kuning text-sm font-extrabold">
                    {nomor}
                </span>
                {judul}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">{children}</div>
        </section>
    );
}

export default function BookForm({
    aksi,
    daftarKategori,
    buku = {},
    untukBaru = false,
}) {
    return (
        <form
            action={aksi}
            className="grid items-start gap-10 lg:grid-cols-[300px_1fr]"
        >
            {buku.id && <input type="hidden" name="id" value={buku.id} />}

            <aside className="lg:sticky lg:top-24">
                <PilihSampul awal={buku.gambar_sampul} judul={buku.judul} />
            </aside>

            <div className="grid gap-9">
                <Bagian nomor="1" judul="Informasi Buku" tunda={80}>
                    <Field
                        label="Judul buku"
                        nama="judul"
                        nilai={buku.judul}
                        penuh
                    />

                    {untukBaru && <Field label="ISBN" nama="isbn" />}

                    <Field
                        label="Penulis"
                        nama="penulis"
                        nilai={buku.penulis}
                    />
                </Bagian>

                <Bagian nomor="2" judul="Penerbitan & Kategori" tunda={180}>
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
                        penuh
                    >
                        {daftarKategori.map((kategori) => (
                            <option key={kategori.id} value={kategori.id}>
                                {kategori.nama}
                            </option>
                        ))}
                    </Field>
                </Bagian>

                <Bagian nomor="3" judul="Stok & Aturan Peminjaman" tunda={280}>
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
                        penuh
                    />
                </Bagian>

                <div
                    className="anim-naik flex flex-wrap items-center gap-3 border-t-2 border-dashed border-biru-muda pt-6"
                    style={{ "--d": "380ms" }}
                >
                    <button className={TOMBOL_UTAMA}>
                        {untukBaru ? "Tambah buku" : "Simpan perubahan"}
                    </button>

                    <Link href="/kelola/buku" className={TOMBOL_BATAL_BESAR}>
                        Batal dan kembali
                    </Link>
                </div>
            </div>
        </form>
    );
}