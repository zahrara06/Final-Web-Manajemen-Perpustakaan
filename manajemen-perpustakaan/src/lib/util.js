import { redirect } from "next/navigation"

export function keluar(path, tipe, pesan) {
    let pemisah = "?";

    if (path.includes("?")) {
        pemisah = "&";
    }

    redirect(`${path}${pemisah}${tipe}=${encodeURIComponent(pesan)}`);
}

export function rupiah(angka) {
    let hasil = Number(angka);

    if (!hasil) {
        hasil = 0;
    }

    return "Rp " + hasil.toLocaleString("id-ID");
}

export const tgl = (tanggal) => {
    if (tanggal) {
        return new Date(tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        });
    } else {
        return "-";
    }
}

export function tglInput(tanggal) {
    if (!tanggal) {
        return "";
    }

    return new Date(tanggal).toLocaleDateString("sv-SE");
}