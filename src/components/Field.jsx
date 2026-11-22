export default function Field({
    label,
    nama,
    tipe = "text",
    nilai,
    wajib = true,
    min,
    penuh = false,
    children,
}) {
    const nilaiAwal =
        nilai === undefined || nilai === null ? "" : String(nilai);

    const lebar = penuh || tipe === "textarea" ? "col-span-full" : "";

    return (
        <label className={`grid gap-1 text-sm font-semibold ${lebar}`}>
            <span>{label}</span>

            {tipe === "textarea" ? (
                <textarea
                    name={nama}
                    rows={4}
                    defaultValue={nilaiAwal}
                    required={wajib}
                />
            ) : tipe === "select" ? (
                <select
                    name={nama}
                    defaultValue={nilaiAwal}
                    required={wajib}
                >
                    {children}
                </select>
            ) : (
                <input
                    name={nama}
                    type={tipe}
                    min={min}
                    defaultValue={nilaiAwal}
                    required={wajib}
                />
            )}
        </label>
    );
}