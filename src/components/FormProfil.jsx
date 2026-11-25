"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { simpanProfil } from "@/app/actions/profil";
import Avatar from "@/components/Avatar";
import Badge from "@/components/Badge";
import IndikatorKekuatanSandi from "@/components/IndikatorKekuatanSandi";
import { TOMBOL_UTAMA } from "@/components/gayaTombol";

const BATAS_FOTO = 2 * 1024 * 1024;

const TAB = [
    { kunci: "data", label: "Data Diri" },
    { kunci: "sandi", label: "Kata Sandi" },
];

function TombolSimpan() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={`${TOMBOL_UTAMA} inline-flex w-fit items-center gap-2`}
        >
            {pending && (
                <span className="size-4 animate-spin rounded-full border-2 border-biru-tua border-t-transparent" />
            )}
            {pending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
    );
}

function Kolom({ label, petunjuk, penuh = false, children }) {
    return (
        <label
            className={`grid content-start gap-1.5 text-sm font-bold ${penuh ? "md:col-span-2" : ""}`}
        >
            <span>{label}</span>
            {children}
            {petunjuk && <small className="font-normal">{petunjuk}</small>}
        </label>
    );
}

const KELAS_TERKUNCI = "cursor-not-allowed !bg-biru-muda/50 opacity-70";

export default function FormProfil({ pengguna }) {
    const [tab, setTab] = useState("data");
    const [nama, setNama] = useState(pengguna.nama_lengkap);
    const [pratinjau, setPratinjau] = useState(null);
    const [hapusFoto, setHapusFoto] = useState(false);
    const [galat, setGalat] = useState("");
    const [sandiBaru, setSandiBaru] = useState("");
    const [ulang, setUlang] = useState("");
    const [lihat, setLihat] = useState(false);

    const jenisSandi = lihat ? "text" : "password";

    function saatPilihFoto(e) {
        const berkas = e.target.files?.[0];

        if (!berkas) {
            setPratinjau(null);
            return;
        }

        if (berkas.size > BATAS_FOTO) {
            setGalat("Ukuran foto maksimal 2 MB.");
            e.target.value = "";
            setPratinjau(null);
            return;
        }

        setGalat("");
        setHapusFoto(false);
        setPratinjau(URL.createObjectURL(berkas));
    }

    const tampilFoto = pratinjau || (pengguna.ada_foto && !hapusFoto);

    return (
        <form action={simpanProfil} className="grid gap-8">
            <section className="anim-naik relative overflow-hidden rounded-[28px] border-[2.5px] border-biru-tua bg-biru-tua text-white shadow-hero">
                <div
                    aria-hidden="true"
                    className="anim-melayang absolute -right-10 -top-10 size-44 rounded-full bg-kuning"
                />
                <div
                    aria-hidden="true"
                    style={{ animationDelay: "1.2s" }}
                    className="anim-melayang absolute right-44 top-24 size-14 rounded-full border-[6px] border-biru-muda/50"
                />
                <div
                    aria-hidden="true"
                    style={{ animationDelay: "2s" }}
                    className="anim-melayang absolute bottom-6 right-16 size-8 rotate-12 rounded-md bg-biru"
                />

                <div className="relative flex flex-wrap items-center gap-6 p-[clamp(1.5rem,4vw,3rem)]">
                    <div className="grid justify-items-center gap-2">
                        <label className="group relative block cursor-pointer rounded-full focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-4 focus-within:outline-kuning">
                            {tampilFoto ? (
                                pratinjau ? (
                                    <img
                                        src={pratinjau}
                                        alt="Pratinjau foto"
                                        className="size-32 rounded-full border-[3px] border-kuning object-cover transition duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <Avatar
                                        id={pengguna.id}
                                        nama={nama}
                                        adaFoto
                                        ukuran="size-32 !border-kuning !border-[3px] object-cover transition duration-300 group-hover:scale-105"
                                    />
                                )
                            ) : (
                                <Avatar
                                    id={pengguna.id}
                                    nama={nama}
                                    adaFoto={false}
                                    ukuran="size-32 !border-kuning !border-[3px] !text-4xl transition duration-300 group-hover:scale-105"
                                />
                            )}

                            <span className="absolute inset-0 grid place-items-center rounded-full bg-biru-tua/70 text-sm font-bold opacity-0 transition duration-300 group-hover:opacity-100">
                                📷 Ganti foto
                            </span>

                            <input
                                type="file"
                                name="foto"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={saatPilihFoto}
                                className="sr-only"
                            />
                        </label>

                        {hapusFoto && (
                            <input type="hidden" name="hapus_foto" value="ya" />
                        )}

                        {pengguna.ada_foto && !pratinjau && (
                            <button
                                type="button"
                                onClick={() => setHapusFoto((nilai) => !nilai)}
                                className="cursor-pointer text-sm font-bold text-kuning underline"
                            >
                                {hapusFoto ? "Batal hapus foto" : "Hapus foto"}
                            </button>
                        )}
                    </div>

                    <div className="grid min-w-0 flex-1 gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge>{pengguna.peran}</Badge>
                            {pengguna.nomor_identitas && (
                                <span className="rounded-full border-2 border-biru-muda/60 px-3 py-0.5 text-xs font-bold text-biru-muda">
                                    {pengguna.nomor_identitas}
                                </span>
                            )}
                        </div>

                        <h1 className="break-words text-[clamp(1.6rem,3.4vw,2.6rem)]">
                            {nama || "Nama Anda"}
                        </h1>

                        <p className="text-biru-muda">{pengguna.email}</p>

                        <small className="text-biru-muda">
                            Klik foto untuk mengganti · JPG, PNG, atau WEBP,
                            maksimal 2 MB
                        </small>

                        {galat && (
                            <p className="w-fit rounded-lg bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                                {galat}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <section
                className="anim-naik grid gap-6"
                style={{ "--d": "150ms" }}
            >
                <div role="tablist" className="flex flex-wrap gap-3">
                    {TAB.map((t) => (
                        <button
                            key={t.kunci}
                            type="button"
                            role="tab"
                            aria-selected={tab === t.kunci}
                            onClick={() => setTab(t.kunci)}
                            className={`cursor-pointer rounded-full border-[2.5px] border-biru-tua px-5 py-2 font-bold transition duration-200 ${
                                tab === t.kunci
                                    ? "-translate-y-0.5 bg-biru-tua text-white shadow-[3px_3px_0_#ffc72c]"
                                    : "bg-white hover:bg-kuning-muda"
                            }`}
                        >
                            <span className="mr-1.5">{t.ikon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>

                <div
                    className={
                        tab === "data"
                            ? "anim-naik grid gap-5 md:grid-cols-2"
                            : "hidden"
                    }
                >
                    <Kolom label="Nama lengkap">
                        <input
                            name="nama_lengkap"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            required
                        />
                    </Kolom>

                    <Kolom label="Email">
                        <input
                            name="email"
                            type="email"
                            defaultValue={pengguna.email}
                            required
                        />
                    </Kolom>
                </div>

                <div
                    className={
                        tab === "sandi"
                            ? "anim-naik grid gap-5 md:grid-cols-2"
                            : "hidden"
                    }
                >
                    <p className="font-semibold md:col-span-2">
                        Kosongkan bagian ini jika tidak ingin mengganti kata
                        sandi.
                    </p>

                    <Kolom label="Kata sandi lama" penuh>
                        <input
                            name="sandi_lama"
                            type={jenisSandi}
                            autoComplete="current-password"
                        />
                    </Kolom>

                    <Kolom label="Kata sandi baru">
                        <input
                            name="sandi_baru"
                            type={jenisSandi}
                            value={sandiBaru}
                            onChange={(e) => setSandiBaru(e.target.value)}
                            autoComplete="new-password"
                        />
                    </Kolom>

                    <Kolom label="Ulangi kata sandi baru">
                        <input
                            name="ulangi"
                            type={jenisSandi}
                            value={ulang}
                            onChange={(e) => setUlang(e.target.value)}
                            autoComplete="new-password"
                        />
                    </Kolom>

                    <div className="grid gap-2 md:col-span-2">
                        <IndikatorKekuatanSandi
                            kataSandi={sandiBaru}
                            kataSandiUlang={ulang}
                        />

                        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-bold">
                            <input
                                type="checkbox"
                                checked={lihat}
                                onChange={(e) => setLihat(e.target.checked)}
                                className="!w-auto"
                            />
                            Tampilkan kata sandi
                        </label>
                    </div>
                </div>

                <hr className="border-t-2 border-dashed border-biru-muda" />

                <div className="flex flex-wrap items-center gap-4">
                    <TombolSimpan />
                </div>
            </section>
        </form>
    );
}