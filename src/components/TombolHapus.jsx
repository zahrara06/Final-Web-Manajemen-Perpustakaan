"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { TOMBOL_HAPUS, TOMBOL_BATAL } from "@/components/gayaTombol";

export default function TombolHapus({
    aksi,
    id,
    pesan = "Yakin ingin menghapus data ini?",
    judul = "Hapus data?",
    labelKonfirmasi = "Ya, Hapus",
}) {
    const [buka, setBuka] = useState(false);
    const idForm = useId();

    useEffect(() => {
        if (!buka) return;

        const tutup = (e) => {
            if (e.key === "Escape") setBuka(false);
        };

        window.addEventListener("keydown", tutup);
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", tutup);
            document.body.style.overflow = "";
        };
    }, [buka]);

    return (
        <>
            <form id={idForm} action={aksi}>
                <input type="hidden" name="id" value={id} />
                <button
                    type="button"
                    onClick={() => setBuka(true)}
                    className={TOMBOL_HAPUS}
                >
                    🗑 Hapus
                </button>
            </form>

            {buka &&
                createPortal(
                    <div
                        role="dialog"
                        aria-modal="true"
                        onClick={() => setBuka(false)}
                        className="fixed inset-0 z-50 grid place-items-center bg-biru-tua/60 p-4 backdrop-blur-sm"
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="anim-naik w-full max-w-sm rounded-[22px] border-[2.5px] border-biru-tua bg-white p-6 shadow-hero"
                        >
                            <div className="mb-4 grid size-14 place-items-center rounded-full border-[2.5px] border-red-700 bg-red-50 text-2xl">
                                🗑
                            </div>

                            <h3 className="text-xl">{judul}</h3>
                            <p className="mt-2 opacity-85">{pesan}</p>
                            <p className="mt-1 text-sm font-semibold text-red-700">
                                Tindakan ini tidak dapat dibatalkan.
                            </p>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setBuka(false)}
                                    className={TOMBOL_BATAL}
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    form={idForm}
                                    className={TOMBOL_HAPUS}
                                >
                                    {labelKonfirmasi}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}