const daftarStatus = {
    menunggu: ["Menunggu Konfirmasi", "bg-amber-100 text-amber-800"],
    dipinjam: ["Sedang Dipinjam", "bg-purple-100 text-purple-800"],
    selesai: ["Selesai", "bg-emerald-100 text-emerald-800"],
    ditolak: ["Ditolak", "bg-red-100 text-red-800"],
    diajukan: ["Perpanjangan Diajukan", "bg-amber-100 text-amber-800"],
    disetujui: ["Perpanjangan Disetujui", "bg-emerald-100 text-emerald-800"],
    tertunggak: ["Denda Tertunggak", "bg-red-100 text-red-800"],
    lunas: ["Denda Lunas", "bg-emerald-100 text-emerald-800"],
    antre: ["Dalam Antrean", "bg-amber-100 text-amber-800"],
    diberitahu: ["Buku Tersedia", "bg-emerald-100 text-emerald-800"],
};

export default function Badge({ s }) {
    const dataStatus = daftarStatus[s];

    if (!dataStatus) {
        return null;
    }

    return (
        <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${dataStatus[1]}`}>
            {dataStatus[0]}
        </span>
    );
}
