import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ATURAN_AKSES = [
    { awalan: "/admin", peran: ["Admin"] },
    { awalan: "/kelola", peran: ["Pegawai", "Admin"] },
    { awalan: "/pegawai", peran: ["Pegawai", "Admin"] },
    { awalan: "/mahasiswa", peran: ["Mahasiswa"] },
];

const BERANDA_PERAN = {
    Admin: "/admin",
    Pegawai: "/pegawai",
    Mahasiswa: "/mahasiswa",
};

async function bacaSesi(request) {
    const token = request.cookies.get("sesi")?.value;

    if (!token) return null;

    try {
        const kunci = new TextEncoder().encode(process.env.SESSION_SECRET);
        const { payload } = await jwtVerify(token, kunci);

        return payload;
    } catch {
        return null;
    }
}

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const sesi = await bacaSesi(request);

    if (sesi && (pathname === "/login" || pathname === "/register")) {
        const beranda = BERANDA_PERAN[sesi.peran];

        if (beranda) {
            return NextResponse.redirect(new URL(beranda, request.url));
        }
    }

    const aturan = ATURAN_AKSES.find(
        ({ awalan }) =>
            pathname === awalan || pathname.startsWith(`${awalan}/`)
    );

    if (!aturan) return NextResponse.next();

    if (!sesi) {
        const urlMasuk = new URL("/login", request.url);
        urlMasuk.searchParams.set("dari", pathname);

        return NextResponse.redirect(urlMasuk);
    }

    if (!aturan.peran.includes(sesi.peran)) {
        const beranda = BERANDA_PERAN[sesi.peran] || "/login";

        return NextResponse.redirect(new URL(beranda, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/kelola/:path*",
        "/pegawai/:path*",
        "/mahasiswa/:path*",
        "/login",
        "/register",
    ],
};