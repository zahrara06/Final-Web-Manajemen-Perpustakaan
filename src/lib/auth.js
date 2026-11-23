import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "sesi";
const SESSION_DURATION = 60 * 60 * 24 * 7;

if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET belum diatur di .env.local");
}

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function buatSesi(pengguna) {
    const token = await new SignJWT({
        id: pengguna.id,
        nama: pengguna.nama_lengkap,
        peran: pengguna.peran,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(sessionSecret);

    (await cookies()).set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_DURATION,
    });
}

export async function ambilSesi() {
    const token = (await cookies()).get(COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, sessionSecret);
        return payload;
    } catch {
        return null;
    }
}

export async function hapusSesi() {
    (await cookies()).delete(COOKIE_NAME);
}

export async function wajibPeran(...allowedRoles) {
    const sesi = await ambilSesi();

    if (!sesi || !allowedRoles.includes(sesi.peran)) {
        redirect("/login");
    }

    return sesi;
}
