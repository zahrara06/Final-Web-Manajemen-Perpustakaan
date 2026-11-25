"use client";

import { useState } from "react";

export default function InputKataSandi() {
    const [terlihat, setTerlihat] = useState(false);

    return (
        <div className="grid gap-1 text-sm font-semibold">
            <label htmlFor="kata_sandi">Kata sandi</label>
            <div className="relative">
                <input
                    id="kata_sandi"
                    name="kata_sandi"
                    type={terlihat ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="pr-12"
                />
                <button
                    type="button"
                    onClick={() => setTerlihat((sebelumnya) => !sebelumnya)}
                    aria-label={
                        terlihat
                            ? "Sembunyikan kata sandi"
                            : "Tampilkan kata sandi"
                    }
                    aria-pressed={terlihat}
                    className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-biru-tua hover:text-biru"
                >
                    {terlihat ? (
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="size-5"
                        >
                            <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
                            <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.3 3.3M6.2 6.2C3.9 7.7 2.7 10 2.5 12c.5 1.3 1.7 3.1 4.1 4.5A10 10 0 0012 19c.9 0 1.7-.1 2.5-.4" />
                        </svg>
                    ) : (
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="size-5"
                        >
                            <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
