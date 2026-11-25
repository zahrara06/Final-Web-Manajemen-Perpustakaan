"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { lupaPassword } from "@/app/actions/auth";
import IndikatorKekuatanSandi from "@/components/IndikatorKekuatanSandi";
import { TOMBOL_UTAMA } from "@/components/gayaTombol";

function TombolUbahKataSandi() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={`${TOMBOL_UTAMA} w-full justify-center`}
        >
            {pending ? "Menyimpan..." : "Ubah kata sandi"}
        </button>
    );
}

export default function FormLupaPassword() {
    const [kataSandi, setKataSandi] = useState("");
    const [ulangi, setUlangi] = useState("");
    const [lihatKataSandi, setLihatKataSandi] = useState(false);
    const [lihatUlangi, setLihatUlangi] = useState(false);

    return (
        <form action={lupaPassword} className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-bold">
                Email
                <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    aria-label="Email"
                    required
                />
            </label>

            <label className="grid gap-1.5 text-sm font-bold">
                Nomor identitas / NIM / NIP
                <input
                    name="nomor_identitas"
                    autoComplete="username"
                    aria-label="Nomor identitas / NIM / NIP"
                    required
                />
            </label>

            <label htmlFor="kata-sandi-baru" className="text-sm font-bold">
                Kata sandi baru
            </label>
            <div className="relative">
                <input
                    id="kata-sandi-baru"
                    type={lihatKataSandi ? "text" : "password"}
                    name="kata_sandi"
                    autoComplete="new-password"
                    value={kataSandi}
                    onChange={(e) => setKataSandi(e.target.value)}
                    className="!pr-12"
                    aria-label="Kata sandi baru"
                    required
                />
                <TombolLihatSandi
                    terlihat={lihatKataSandi}
                    saatKlik={() => setLihatKataSandi((nilai) => !nilai)}
                    label="kata sandi baru"
                />
            </div>

            <label htmlFor="ulangi-kata-sandi" className="text-sm font-bold">
                Ulangi kata sandi baru
            </label>
            <div className="relative">
                <input
                    id="ulangi-kata-sandi"
                    type={lihatUlangi ? "text" : "password"}
                    name="ulangi"
                    autoComplete="new-password"
                    value={ulangi}
                    onChange={(e) => setUlangi(e.target.value)}
                    className="!pr-12"
                    aria-label="Ulangi kata sandi baru"
                    required
                />
                <TombolLihatSandi
                    terlihat={lihatUlangi}
                    saatKlik={() => setLihatUlangi((nilai) => !nilai)}
                    label="ulangi kata sandi"
                />
            </div>

            <IndikatorKekuatanSandi
                kataSandi={kataSandi}
                kataSandiUlang={ulangi}
            />

            <div className="grid gap-3 sm:grid-cols-2">
                <Link
                    href="/"
                    className="inline-flex w-full items-center justify-center rounded-xl border-[2.5px] border-biru-tua bg-biru-tua px-3 py-2 text-center text-sm font-bold text-white shadow-[3px_3px_0_#ffc72c] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-biru hover:shadow-[1px_1px_0_#ffc72c]"
                >
                    Kembali ke beranda
                </Link>
                <TombolUbahKataSandi />
            </div>
        </form>
    );
}

function TombolLihatSandi({ terlihat, saatKlik, label }) {
    return (
        <button
            type="button"
            onClick={saatKlik}
            aria-label={`${terlihat ? "Sembunyikan" : "Tampilkan"} ${label}`}
            aria-pressed={terlihat}
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-biru-tua transition hover:bg-kuning-muda"
        >
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
            >
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
                {!terlihat && <path d="m3 3 18 18" />}
            </svg>
        </button>
    );
}
