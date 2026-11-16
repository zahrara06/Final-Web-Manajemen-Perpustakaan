import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET belum diatur di .env.local");
}

const kunciSesi = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function buatSesi(user) {
    const tokenSesi = await new SignJWT({
        id: user.id,
        nama: user.nama_lengkap,
        role: user.peran,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(kunciSesi);

    (await cookies()).set("sesi", tokenSesi, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });
}

export async function hapusSesi() {
    (await cookies()).delete("sesi");
}

export async function getUserLogin() {
    const tokenSesi = (await cookies()).get("sesi")?.value;

    if (!tokenSesi) return null;

    try {
        const { payload: dataToken } = await jwtVerify(tokenSesi, kunciSesi);
        return dataToken;
    } catch {
        return null;
    }
}

export async function requireRole(...peranDiizinkan) {
    const user = await getUserLogin();

    if (!user) {
        redirect("/login");
    }

    if (!peranDiizinkan.includes(user.role)) {
        redirect("/");
    }

    return user;
}
