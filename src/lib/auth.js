import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const NAMA_COOKIE = "sesi";
const LAMA_SESI_DETIK = 60 * 60 * 24 * 7;

if (!process.env.RAHASIA_SESI) {
    throw new Error("RAHASIA_SESI belum diatur di .env.local");
}

const kunciRahasia = new TextEncoder().encode(process.env.RAHASIA_SESI);

export async function buatSesi(pengguna) {
    const token = await new SignJWT({
        id: pengguna.id,
        nama: pengguna.nama_lengkap,
        peran: pengguna.peran,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(kunciRahasia);

    (await cookies()).set(NAMA_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: LAMA_SESI_DETIK,
    });
}

export async function ambilSesi() {
    const token = (await cookies()).get(NAMA_COOKIE)?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, kunciRahasia);
        return payload;
    } catch {
        return null;
    }
}

export async function hapusSesi() {
    (await cookies()).delete(NAMA_COOKIE);
}

export async function requireRole(...allowedRoles) {
    const sesi = await ambilSesi();

    if (!sesi || !allowedRoles.includes(sesi.peran)) {
        redirect("/login");
    }

    return sesi;
}
