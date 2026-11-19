import Link from "next/link";
import Field from "@/components/Field";
import Pesan from "@/components/Pesan";
import { register } from "@/app/actions/auth";

export default async function RegisterPage({ searchParams }) {
    const sp = await searchParams;

    return (
        <div className="max-w-md mx-auto card p-6">
            <h1 className="text-2xl font-bold text-purple-900 mb-4">
                Buat Akun
            </h1>

            <Pesan sp={sp} />

            <form action={register} className="space-y-3">
                <Field label="Nama lengkap" name="nama" />

                <Field
                    label="Email kampus (.ac.id)"
                    name="email"
                    type="email"
                    placeholder="nama@student.univ.ac.id"
                />

                <Field label="NIM" name="nomor_identitas" />

                <Field
                    label="Password (min. 6 karakter)"
                    name="password"
                    type="password"
                    minLength={6}
                />

                <button className="btn w-full">Daftar</button>
            </form>

            <p className="mt-4 text-sm text-center">
                Sudah punya akun?{" "}
                <Link
                    href="/login"
                    className="text-purple-600 hover:underline"
                >
                    Masuk
                </Link>
            </p>
        </div>
    );
}
