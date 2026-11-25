"use client";

import { useEffect, useState } from "react";

export default function AngkaHitung({ nilai, rupiah = false, durasi = 1200 }) {
    const [tampil, setTampil] = useState(0);

    useEffect(() => {
        const kurangiGerak = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (kurangiGerak) {
            id = requestAnimationFrame(() => setTampil(nilai));
            return;
        }

        const mulai = performance.now();
        let id;

        const langkah = (waktu) => {
            const p = Math.min((waktu - mulai) / durasi, 1);
            const halus = 1 - Math.pow(1 - p, 3);

            setTampil(Math.round(nilai * halus));

            if (p < 1) id = requestAnimationFrame(langkah);
        };

        id = requestAnimationFrame(langkah);

        return () => cancelAnimationFrame(id);
    }, [nilai, durasi]);

    const teks = tampil.toLocaleString("id-ID");

    return <>{rupiah ? `Rp ${teks}` : teks}</>;
}