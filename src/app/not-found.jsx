import Link from "next/link";

export default function TidakDitemukan() {
    return (
        <div className="block border-[2.5px] border-biru-tua rounded-[18px] shadow-keras p-5 bg-white text-center">
            <h1>404</h1>

            <p className="mt-3 mb-[1.4rem]">
                Halaman yang Anda cari tidak ada di LiteraSpace.
            </p>
            
            <Link href="/" className="inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-5 py-2.5 shadow-tombol bg-kuning">
                Kembali ke Beranda
            </Link>
        </div>
    );
}