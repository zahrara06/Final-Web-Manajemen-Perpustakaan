"use client";

const TINGKAT = [
    { label: "Terlalu pendek", warna: "bg-red-500" },
    { label: "Lemah", warna: "bg-red-500" },
    { label: "Sedang", warna: "bg-kuning" },
    { label: "Kuat", warna: "bg-green-500" },
    { label: "Sangat kuat", warna: "bg-green-600" },
];

function hitungKekuatan(sandi) {
    if (sandi.length < 6) return 0;

    let skor = 1;

    if (sandi.length >= 10) skor++;
    if (/[a-z]/.test(sandi) && /[A-Z]/.test(sandi)) skor++;
    if (/\d/.test(sandi) && /[^A-Za-z0-9]/.test(sandi)) skor++;

    return Math.min(skor, 4);
}

export default function IndikatorKekuatanSandi({
    kataSandi,
    kataSandiUlang,
}) {
    const skor = hitungKekuatan(kataSandi);
    const tingkat = TINGKAT[skor];
    const terisi = kataSandi ? Math.max(skor, 1) : 0;

    return (
        <div className="grid gap-2">
            <div
                role="meter"
                aria-label="Kekuatan kata sandi"
                aria-valuemin={0}
                aria-valuemax={4}
                aria-valuenow={skor}
                aria-valuetext={kataSandi ? tingkat.label : "Belum diisi"}
                className="flex gap-1.5"
            >
                {[1, 2, 3, 4].map((n) => (
                    <span
                        key={n}
                        className={`h-2.5 flex-1 rounded-full border-2 border-biru-tua transition-all duration-500 ${
                            n <= terisi ? tingkat.warna : "bg-white"
                        }`}
                    />
                ))}
            </div>

            <div
                aria-live="polite"
                className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold"
            >
                <span>
                    {kataSandi
                        ? `Kekuatan: ${tingkat.label}`
                        : "Minimal 6 karakter. Campur huruf besar, kecil, angka, dan simbol agar lebih kuat."}
                </span>

                {kataSandiUlang && (
                    <span
                        className={
                            kataSandiUlang === kataSandi
                                ? "text-green-700"
                                : "text-red-700"
                        }
                    >
                        {kataSandiUlang === kataSandi
                            ? "Kata sandi cocok ✓"
                            : "Belum sama"}
                    </span>
                )}
            </div>
        </div>
    );
}
