import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
    title: "LiteraSpace | Perpustakaan Kampus",
    description:
        "Katalog, peminjaman, dan pengumuman perpustakaan kampus dalam satu tempat.",
};

export const dynamic = "force-dynamic";

export default function TataLetakUtama({ children }) {
    return (
        <html lang="id">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin=""
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Inter:wght@400;500;600;700&display=swap"
                />
            </head>

            <body className="flex min-h-screen flex-col bg-white bg-[radial-gradient(#dbe7ff_1.3px,transparent_1.3px)] bg-[length:24px_24px] leading-relaxed text-biru-tua">
                <Navbar />

                <main className="grid w-full flex-1 content-start gap-10 px-[clamp(1rem,4vw,4.5rem)] pt-8 pb-16">
                    {children}
                </main>

                <footer className="bg-biru-tua p-5 text-center text-sm text-kuning-muda">
                    &copy; 2026 LiteraSpace. Perpustakaan Kampus Digital.
                </footer>
            </body>
        </html>
    );
}
