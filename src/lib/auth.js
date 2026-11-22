import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const NAMA_COOKIE = "sesi";
const LAMA_SESI_DETIK = 60 * 60 * 24 * 7;

if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET belum diatur di .env.local");
}

const kunciSesi = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function buatSesi(pengguna) {
    const tokenSesi = await new SignJWT({
        id: pengguna.id,
        nama: pengguna.nama_lengkap,
        peran: pengguna.peran,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(kunciSesi);

    (await cookies()).set(NAMA_COOKIE, tokenSesi, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: LAMA_SESI_DETIK,
    });
}

export async function ambilSesi() {
    const tokenSesi = (await cookies()).get(NAMA_COOKIE)?.value;

    if (!tokenSesi) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(tokenSesi, kunciSesi);
        return payload;
    } catch {
        return null;
    }
}

export async function hapusSesi() {
    (await cookies()).delete(NAMA_COOKIE);
}

export async function wajibPeran(...peranDiizinkan) {
    const sesi = await ambilSesi();

    if (!sesi) {
        redirect("/login");
    }

    if (!peranDiizinkan.includes(sesi.peran)) {
        redirect("/");
    }

    return sesi;
}
