import Field from "./Field";

export default function CategoryForm({ action, kategori }) {
    const dataKategori = kategori || {};

    return (
        <form action={action} className="grid sm:grid-cols-3 gap-3 mt-3">
            {dataKategori.id && (
                <input type="hidden" name="id" value={dataKategori.id} />
            )}

            <Field
                label="Nama kategori"
                name="nama"
                defaultValue={dataKategori.nama}
            />

            <Field
                label="Kode klasifikasi"
                name="kode"
                defaultValue={dataKategori.kode}
            />

            <Field
                label="Deskripsi singkat"
                name="deskripsi"
                required={false}
                defaultValue={dataKategori.deskripsi}
            />

            <div className="sm:col-span-3">
                <button className="btn">Simpan</button>
            </div>
        </form>
    );
}
