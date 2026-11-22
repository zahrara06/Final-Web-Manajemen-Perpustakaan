"use client";

import dynamic from "next/dynamic";

const Adegan3D = dynamic(() => import("./Adegan3D"), {
    ssr: false,
    loading: () => <div className="grid h-full place-items-center text-biru-muda">Memuat adegan 3D...</div>,
});

export default function Latar3D() {
    return <Adegan3D />;
}