import Field from "@/components/Field";

export default function CategoryForm({ aksi, kategori = {} }) {
    return (
        <form action={aksi} className="grid gap-4 md:grid-cols-2">
            {kategori.id && (
                <input
                    type="hidden"
                    name="id"
                    value={kategori.id}
                />
            )}

            <Field
                label="Nama kategori"
                nama="nama"
                nilai={kategori.nama}
            />

            <Field
                label="Kode klasifikasi"
                nama="kode"
                nilai={kategori.kode}
            />

            <Field
                label="Deskripsi singkat"
                nama="deskripsi"
                tipe="textarea"
                nilai={kategori.deskripsi}
                wajib={false}
            />

            <button className="col-span-full inline-block cursor-pointer rounded-xl border-[2.5px] border-biru-tua bg-kuning px-5 py-2.5 text-center font-bold text-biru-tua shadow-tombol transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55">
                {kategori.id ? "Simpan perubahan" : "Tambah kategori"}
            </button>
        </form>
    );
}