"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ajukanBayarDenda } from "@/app/actions/loans";

const REKENING = [
    {
        bank: "Bank BRI",
        nomor: "1234010001234567",
        atasNama: "Perpustakaan LiteraSpace",
    },
    {
        bank: "Bank Mandiri",
        nomor: "1700012345678",
        atasNama: "Perpustakaan LiteraSpace",
    },
    {
        bank: "Bank BNI",
        nomor: "0123456789",
        atasNama: "Perpustakaan LiteraSpace",
    },
];

const KELAS_TOMBOL =
    "inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-3 py-1 text-sm shadow-[2px_2px_0_#0b1b4d] bg-kuning";

const KELAS_TOMBOL_KIRIM =
    "inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] px-5 py-2.5 shadow-tombol bg-kuning";

export default function FormBayarDenda({ peminjamanId, judulBuku, nominal }) {
    const [buka, setBuka] = useState(false);
    const idDialog = useId();

    useEffect(() => {
        if (!buka) return;

        const tutupDenganEscape = (event) => {
            if (event.key === "Escape") setBuka(false);
        };

        window.addEventListener("keydown", tutupDenganEscape);
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", tutupDenganEscape);
            document.body.style.overflow = "";
        };
    }, [buka]);

    return (
        <>
            <button
                type="button"
                onClick={() => setBuka(true)}
                className={KELAS_TOMBOL}
            >
                Bayar Denda
            </button>

            {buka &&
                createPortal(
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={idDialog}
                        onClick={() => setBuka(false)}
                        className="fixed inset-0 z-50 grid place-items-center bg-biru-tua/60 p-4 backdrop-blur-sm"
                    >
                        <div
                            onClick={(event) => event.stopPropagation()}
                            className="anim-naik max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[22px] border-[2.5px] border-biru-tua bg-white p-6 shadow-hero"
                        >
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <h2 id={idDialog}>Bayar Denda</h2>
                                    <p>{judulBuku}</p>
                                    <p>
                                        Jumlah yang harus dibayar: <strong>{nominal}</strong>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setBuka(false)}
                                    className="cursor-pointer font-bold text-biru-tua"
                                >
                                    Tutup
                                </button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <strong>QRIS</strong>
                                    <p>Scan QRIS dan bayar sesuai jumlah denda.</p>
                                    <Image
                                        src="/qr-bayar-denda.png"
                                        alt="QRIS pembayaran denda"
                                        width={200}
                                        height={200}
                                        className="mt-2 rounded-lg border-2 border-biru-muda"
                                    />
                                </div>

                                <div>
                                    <strong>Transfer bank</strong>
                                    <div className="mt-2 grid gap-2">
                                        {REKENING.map((rekening) => (
                                            <div
                                                key={rekening.bank}
                                                className="rounded-lg border border-biru-muda p-2"
                                            >
                                                <strong>{rekening.bank}</strong>
                                                <div>Nomor: {rekening.nomor}</div>
                                                <div>Atas nama: {rekening.atasNama}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <form
                                action={ajukanBayarDenda}
                                encType="multipart/form-data"
                                className="mt-5 grid gap-3"
                            >
                                <input
                                    type="hidden"
                                    name="peminjaman_id"
                                    value={peminjamanId}
                                />

                                <label className="grid gap-1 font-semibold">
                                    Metode pembayaran
                                    <select name="metode" required defaultValue="QRIS">
                                        <option value="QRIS">QRIS</option>
                                        <option value="Transfer">Transfer bank</option>
                                    </select>
                                </label>

                                <label className="grid gap-1 font-semibold">
                                    Foto bukti pembayaran (JPG, PNG, atau WEBP; maks. 2 MB)
                                    <input
                                        type="file"
                                        name="bukti"
                                        accept="image/jpeg,image/png,image/webp"
                                        required
                                    />
                                </label>

                                <button className={KELAS_TOMBOL_KIRIM}>
                                    Kirim bukti pembayaran
                                </button>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
