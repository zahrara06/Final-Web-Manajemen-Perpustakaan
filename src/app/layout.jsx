import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
    title: "Pustakaloka",
    description: "Sistem Informasi Manajemen Perpustakaan Kampus",
};

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <body className="min-h-screen flex flex-col">
                <Navbar />

                <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
                    {children}
                </main>

                <footer className="text-center text-sm text-slate-500 py-6">
                    © 2026 Pustakaloka
                </footer>
            </body>
        </html>
    );
}
