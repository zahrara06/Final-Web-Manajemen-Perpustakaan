import Link from "next/link";
import { lupaPassword } from "@/app/actions/auth";
import Pesan from "@/components/Pesan";

const KELAS_TOMBOL =
    "inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] px-5 py-2.5 shadow-tombol bg-kuning";

export default async function LupaPassword({ searchParams }) {
    const sp = await searchParams;

    return (
        <section className="mx-auto grid max-w-ms gap-4">
            <h1>Lupa Kata Sandi</h1>
            <Pesan sp={sp} />

            <p>
                Masukkan email dan nomor identitas (NIM/NIP) akun Anda
                untuk verifikasi, lalu tentukan kata sandi baru.
            </p>

            <form action={lupaPassword} className="grid gap-3">
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    aria-label="Email"
                    required
                />
                <input
                    name="nomor_identitas"
                    placeholder="Nomor identitas / NIM"
                    aria-label="Nomor identitas"
                    required
                />
                <input
                    type="password"
                    name="kata_sandi"
                    placeholder="Kata sandi baru (min. 6 karakter)"
                    aria-label="Kata sandi baru"
                    required
                />
                <input
                    type="password"
                    name="ulangi"
                    placeholder="Ulangi kata sandi baru"
                    aria-label="Ulangi kata sandi"
                    required
                />
                <button className={KELAS_TOMBOL}>Ubah kata sandi</button>
            </form>

            <Link href="/login" className="font-bold text-biru underline">
                Kembali ke halaman masuk
            </Link>
        </section>
    );
}