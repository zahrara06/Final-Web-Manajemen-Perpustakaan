import Link from "next/link";

export default function BookCard({ b }) {
    return (
        <Link
            href={`/katalog/${b.id}`}
            className="card hover:border-purple-300 hover:shadow-md transition flex flex-col"
        >
            {b.cover_url ? (
                <img
                    src={b.cover_url}
                    alt={b.judul}
                    className="w-full h-52 object-cover rounded-lg mb-3"
                />
            ) : (
                <div className="w-full h-52 bg-purple-100 rounded-lg mb-3 flex items-center justify-center text-4xl">
                    📘
                </div>
            )}

            {b.kategori && (
                <span className="text-xs text-purple-600 font-medium">
                    {b.kategori}
                </span>
            )}

            <h3 className="font-semibold leading-snug">{b.judul}</h3>

            <p className="text-sm text-slate-500">{b.pengarang}</p>

            <div className="mt-auto pt-2 flex justify-between text-xs text-slate-600">
                {b.stok_tersedia !== undefined && (
                    <span>Stok: {b.stok_tersedia}</span>
                )}

                {b.rating !== undefined && (
                    <span>⭐ {Number(b.rating).toFixed(1)}</span>
                )}

                {b.total_pinjam !== undefined && (
                    <span>{b.total_pinjam}x dipinjam</span>
                )}
            </div>
        </Link>
    );
}
