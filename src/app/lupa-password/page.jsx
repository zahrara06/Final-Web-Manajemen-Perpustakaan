import FormLupaPassword from "@/components/FormLupaPassword";
import Pesan from "@/components/Pesan";

export default async function LupaPassword({ searchParams }) {
    const sp = await searchParams;

    return (
        <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[28px] border-[2.5px] border-biru-tua bg-white shadow-hero md:grid-cols-[0.85fr_1.15fr]">
            <aside className="relative isolate grid min-h-[280px] content-center overflow-hidden bg-biru-tua p-7 text-white sm:p-9 md:min-h-[620px]">
                <div
                    aria-hidden="true"
                    className="anim-melayang absolute -right-12 -top-12 size-52 rounded-full bg-kuning"
                />
                <div
                    aria-hidden="true"
                    className="anim-melayang absolute bottom-16 right-10 size-16 rounded-full border-[6px] border-biru-muda/50"
                />

                <div className="relative z-10">
                    <h1 className="text-[clamp(2rem,4vw,3.2rem)] text-white">
                        Lupa kata sandi?
                    </h1>
                    <p className="mt-4 max-w-[34ch] text-biru-muda">
                        Verifikasi akun dan buat kata sandi baru untuk kembali
                        ke LiteraSpace.
                    </p>
                </div>
            </aside>

            <div className="grid content-center gap-5 p-6 sm:p-9 lg:p-10">
                <header className="grid gap-3">
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-biru">
                        Verifikasi akun
                    </p>
                    <h2>Buat kata sandi baru</h2>
                    <p className="mt-2 text-sm text-biru-tua/70">
                        Gunakan kata sandi yang kuat dan mudah Anda ingat.
                    </p>
                </header>

                <Pesan sp={sp} />
                <FormLupaPassword />
            </div>
        </section>
    );
}