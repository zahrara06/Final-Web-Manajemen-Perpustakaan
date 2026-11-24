import Link from "next/link";
import Latar3D from "@/components/Latar3D";
import Pesan from "@/components/Pesan";
import Field from "@/components/Field";
import { masuk } from "@/app/actions/auth";

export default async function HalamanLogin({ searchParams }) {
    const sp = await searchParams;
    
    return (
        <section className="grid overflow-hidden rounded-[28px] border-[2.5px] border-biru-tua bg-white shadow-hero md:grid-cols-2">
            <div className="grid min-h-[300px] grid-rows-[auto_1fr] bg-[radial-gradient(circle,#1d4ed8,#0b1b4d_75%)] text-white md:min-h-[480px] [&_h2]:px-6 [&_h2]:pt-6">
                <h2>Selamat datang kembali.</h2>
                <Latar3D />
            </div>

            <div className="grid content-center gap-5 p-6 md:p-10">
                <h1 className="text-[2.2rem]">Login</h1>
                <Pesan sp={sp} />

                <form action={masuk} className="grid gap-4">
                <input type="hidden" name="dari" value={sp.dari ?? ""} />
                <Field label="Email" nama="email" tipe="email" />
                <Field label="Kata sandi" nama="kata_sandi" tipe="password" />

                <button className="inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-5 py-2.5 shadow-tombol bg-kuning">
                    Masuk
                </button>
                <Link href="/katalog" className="inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-5 py-2.5 shadow-tombol bg-white">
                    Lanjut sebagai Tamu
                </Link>
                <Link href="/lupa-password" className="font-bold text-sm underline">
                    Lupa kata sandi?
                </Link>
                <p className="text-sm opacity-80">Belum punya akun?
                    <Link href="/register"><u> Daftar sebagai Mahasiswa</u></Link>
                </p>
                </form>
            </div>
        </section>
    );
}