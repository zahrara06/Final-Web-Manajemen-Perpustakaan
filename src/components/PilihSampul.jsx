"use client";

import { useRef, useState } from "react";
import { TOMBOL_BATAL } from "@/components/gayaTombol";

const BATAS = 2 * 1024 * 1024;
const TIPE = ["image/jpeg", "image/png", "image/webp"];

export default function PilihSampul({ awal, judul }) {
    const inputRef = useRef(null);
    const [pratinjau, setPratinjau] = useState(null);
    const [seret, setSeret] = useState(false);
    const [hapus, setHapus] = useState(false);
    const [galat, setGalat] = useState("");
    const [namaBerkas, setNamaBerkas] = useState("");

    function proses(berkas) {
        if (!berkas) {
            setPratinjau(null);
            setNamaBerkas("");
            return;
        }

        if (!TIPE.includes(berkas.type)) {
            setGalat("Format harus JPG, PNG, atau WEBP.");
            inputRef.current.value = "";
            return;
        }

        if (berkas.size > BATAS) {
            setGalat("Ukuran gambar maksimal 2 MB.");
            inputRef.current.value = "";
            return;
        }

        setGalat("");
        setHapus(false);
        setNamaBerkas(berkas.name);
        setPratinjau(URL.createObjectURL(berkas));
    }

    function saatLepas(e) {
        e.preventDefault();
        setSeret(false);

        const berkas = e.dataTransfer.files?.[0];

        if (!berkas) return;

        const daftar = new DataTransfer();
        daftar.items.add(berkas);
        inputRef.current.files = daftar.files;

        proses(berkas);
    }

    const gambar = pratinjau || (awal && !hapus ? awal : null);

    return (
        <div className="anim-naik grid gap-3">
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setSeret(true);
                }}
                onDragLeave={() => setSeret(false)}
                onDrop={saatLepas}
                className={`relative aspect-[3/4] w-full overflow-hidden rounded-[14px] border-[2.5px] bg-white transition duration-300 ${
                    seret
                        ? "scale-[1.03] border-solid border-biru bg-biru-muda shadow-keras"
                        : gambar
                          ? "border-solid border-biru-tua shadow-keras"
                          : "border-dashed border-biru-tua"
                }`}
            >
                {gambar ? (
                    <img
                        key={gambar}
                        src={gambar}
                        alt={`Sampul ${judul || "buku"}`}
                        className="anim-naik size-full object-cover"
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => inputRef.current.click()}
                        className="group grid size-full cursor-pointer place-items-center content-center gap-2 p-5 text-center"
                    >
                        <span className="anim-melayang text-5xl">📚</span>
                        <strong>Seret gambar ke sini</strong>
                        <small>atau klik untuk memilih dari penyimpanan</small>
                    </button>
                )}

                {seret && (
                    <div className="absolute inset-0 grid place-items-center bg-biru/80 font-bold text-white">
                        Lepaskan untuk mengunggah
                    </div>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                name="sampul"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => proses(e.target.files?.[0])}
                className="sr-only"
            />

            {hapus && <input type="hidden" name="hapus_sampul" value="ya" />}

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => inputRef.current.click()}
                    className={TOMBOL_BATAL}
                >
                    📁 {gambar ? "Ganti gambar" : "Pilih gambar"}
                </button>

                {awal && !pratinjau && (
                    <button
                        type="button"
                        onClick={() => setHapus((nilai) => !nilai)}
                        className={TOMBOL_BATAL}
                    >
                        {hapus ? "Batal hapus" : "Hapus sampul"}
                    </button>
                )}
            </div>

            {namaBerkas && (
                <small className="break-all font-semibold">{namaBerkas}</small>
            )}

            {galat && <small className="font-bold text-red-700">{galat}</small>}

            <small>Sampul opsional · JPG, PNG, atau WEBP · maksimal 2 MB</small>
        </div>
    );
}