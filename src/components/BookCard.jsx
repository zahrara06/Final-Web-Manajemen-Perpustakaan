import Link from "next/link";

const WARNA_SAMPUL = [
    "bg-kuning",
    "bg-biru text-white",
    "bg-white bg-[repeating-linear-gradient(0deg,transparent_0_22px,#dbe7ff_22px_24px)]",
];

export function Sampul({ buku }) {
    if (buku.gambar_sampul) {
        return (
            <img
                className="block aspect-[3/4] w-full rounded-[10px] border-[2.5px] border-biru-tua object-cover"
                src={buku.gambar_sampul}
                alt={`Sampul ${buku.judul}`}
            />
        );
    }

    return (
        <div
            className={`grid aspect-[3/4] w-full place-items-center rounded-[10px] border-[2.5px] border-l-[12px] border-biru-tua p-4 text-center font-judul text-[1.05rem] font-extrabold ${WARNA_SAMPUL[buku.id % 3]}`}
        >
            <span>{buku.judul}</span>
        </div>
    );
}

export function Bintang({ nilai }) {
    return (
        <span className="font-semibold text-amber-700">
            ★ {Number(nilai).toFixed(1)}
        </span>
    );
}

export default function BookCard({ buku, peringkat }) {
    return (
        <Link
            href={`/katalog/${buku.id}`}
            className="relative grid h-full grid-rows-[auto_1fr] gap-3 rounded-[18px] border-[2.5px] border-biru-tua bg-white p-3 shadow-keras transition hover:-translate-x-[3px] hover:-translate-y-[3px] hover:-rotate-[0.6deg]"
        >
            {peringkat && (
                <span className="absolute -top-3 -left-3 z-[2] -rotate-[8deg] rounded-xl border-[2.5px] border-biru-tua bg-kuning px-2.5 font-extrabold">
                    #{peringkat}
                </span>
            )}

            <Sampul buku={buku} />

            <div className="grid content-start gap-0.5">
                <small className="line-clamp-1 min-h-5">
                    {buku.nama_kategori}
                </small>
                <h3 className="line-clamp-2 min-h-[2.35em]">
                    {buku.judul}
                </h3>
                <p className="line-clamp-2 min-h-10 text-sm opacity-75">
                    {buku.penulis}
                </p>

                <div className="mt-1.5 flex flex-wrap gap-3 text-xs font-semibold">
                    {buku.rata_rating !== undefined && (
                        <Bintang nilai={buku.rata_rating} />
                    )}

                    {buku.stok_tersedia !== undefined && (
                        <span>Stok {buku.stok_tersedia}</span>
                    )}

                    {buku.total_pinjam !== undefined && (
                        <span>{buku.total_pinjam}x dipinjam</span>
                    )}
                </div>
            </div>
        </Link>
    );
}