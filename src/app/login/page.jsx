import Link from "next/link";
import Field from "@/components/Field";
import Pesan from "@/components/Pesan";
import { login } from "@/app/actions/auth";

export default async function LoginPage({ searchParams }) {
    const sp = await searchParams;

    return (
        <div className="max-w-md mx-auto card p-6">
            <h1 className="text-2xl font-bold text-purple-900 mb-4">
                Masuk
            </h1>

            <Pesan sp={sp} />

            <form action={login} className="space-y-3">
                <Field label="Email" name="email" type="email" />
                <Field label="Password" name="password" type="password" />

                <button className="btn w-full">Masuk</button>
            </form>

            <Link href="/katalog" className="btn-sec w-full mt-3">
                Continue as Guest
            </Link>

            <p className="mt-4 text-sm text-center">
                Belum punya akun?{" "}
                <Link
                    href="/register"
                    className="text-purple-600 hover:underline"
                >
                    Daftar sebagai Mahasiswa
                </Link>
            </p>
        </div>
    );
}
