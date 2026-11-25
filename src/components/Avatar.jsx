export default function Avatar({ id, nama, adaFoto, ukuran = "size-9" }) {
    const inisial = String(nama || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((kata) => kata[0]?.toUpperCase())
        .join("");

    const dasar = `${ukuran} shrink-0 rounded-full border-[2.5px] border-biru-tua`;

    return adaFoto ? (
        <img
            src={`/api/foto/${id}`}
            alt={nama}
            className={`${dasar} object-cover`}
        />
    ) : (
        <span
            className={`${dasar} grid place-items-center bg-kuning text-xs font-extrabold text-biru-tua`}
        >
            {inisial}
        </span>
    );
}