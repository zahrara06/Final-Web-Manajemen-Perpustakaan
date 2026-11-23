import Link from "next/link";
import Latar3D from "@/components/Latar3D";
import Pesan from "@/components/Pesan";
import Field from "@/components/Field";
import { daftar } from "@/app/actions/auth";

export default async function HalamanRegister({ searchParams }) {
    const sp = await searchParams;
    
    return (
        <section className="grid overflow-hidden rounded-[28px] border-[2.5px] border-biru-tua bg-white shadow-hero md:grid-cols-2">
            <div className="grid min-h-[300px] grid-rows-[auto_1fr] bg-[radial-gradient(circle,#1d4ed8,#0b1b4d_75%)] text-white md:min-h-[480px] [&_h2]:px-6 [&_h2]:pt-6">
                <Latar3D />
            </div>

            <div className="grid content-center gap-5 p-6 md:p-10">
                <h1 className="text-[2.2rem]">Daftar Mahasiswa</h1>
                <Pesan sp={sp} />
                <form action={daftar} className="grid gap-4">
                <Field label="Nama lengkap" nama="nama_lengkap" />
                <Field label="Email kampus (.ac.id / .edu)" nama="email" tipe="email" />
                <Field label="NIM" nama="nomor_identitas" />
                <Field label="Kata sandi (min. 6 karakter)" nama="kata_sandi" tipe="password" />
                <button className="inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-5 py-2.5 shadow-tombol bg-kuning">
                    Daftar
                </button>
                <p className="text-sm opacity-80">Sudah punya akun? 
                    <Link href="/login"><u>Masuk</u></Link>
                </p>
                </form>
            </div>
        </section>
    );
}
