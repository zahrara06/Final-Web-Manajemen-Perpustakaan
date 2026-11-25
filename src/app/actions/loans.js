"use server";

import pool, { dalamTransaksi } from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { ambilTeks, ambilAngka, jalankan, rupiah } from "@/lib/util";
import { catatNotifPeminjaman } from "@/lib/notif";

export async function ajukanPinjam(formData) {
    const sesi = await wajibPeran("Mahasiswa");
    const bukuId = ambilAngka(formData, "buku_id");

    await jalankan(
        "/mahasiswa",
        "Permohonan terkirim. Temui petugas di meja sirkulasi untuk konfirmasi.",
        async () => {
            const dendaTertunggak = await pool.query(
                "SELECT 1 FROM peminjaman WHERE pengguna_id = $1 AND status_denda = 'Tertunggak' LIMIT 1",
                [sesi.id]
            );
            
            if (dendaTertunggak.rowCount > 0) {
                throw new Error(
                    "Pengajuan diblokir: lunasi denda tertunggak terlebih dahulu."
                );
            }

            const buku = await pool.query(
                "SELECT stok_tersedia FROM buku WHERE id = $1",
                [bukuId]
            );

            if (!(buku.rows[0]?.stok_tersedia > 0)) {
                throw new Error("Stok buku sedang habis.");
            }

            const sudahAda = await pool.query(
                `SELECT 1
                FROM peminjaman
                WHERE pengguna_id = $1
                AND buku_id = $2
                AND status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')
                LIMIT 1`,
                [sesi.id, bukuId]
            );

            if (sudahAda.rowCount > 0) {
                throw new Error(
                    "Anda sudah mengajukan atau sedang meminjam buku ini."
                );
            }

            await pool.query(
                "INSERT INTO peminjaman (pengguna_id, buku_id) VALUES ($1, $2)",
                [sesi.id, bukuId]
            );
        }
    );
}

export async function ajukanPerpanjangan(formData) {
    const sesi = await wajibPeran("Mahasiswa");
    const id = ambilAngka(formData, "id");

    await jalankan(
        "/mahasiswa",
        "Perpanjangan diajukan, menunggu persetujuan petugas.",
        async () => {
            const hasil = await pool.query(
                `UPDATE peminjaman
                SET status_perpanjangan = 'Diajukan'
                WHERE id = $1
                AND pengguna_id = $2
                AND status = 'Sedang Dipinjam'
                AND jatuh_tempo > CURRENT_DATE
                AND status_perpanjangan = 'Tidak Ada'`,
                [id, sesi.id]
            );

            if (hasil.rowCount === 0) {
                throw new Error(
                    "Perpanjangan hanya dapat diajukan sebelum jatuh tempo dan satu kali per peminjaman."
                );
            }
        }
    );
}

export async function setujuiPinjam(formData) {
    await wajibPeran("Pegawai", "Admin");
    const id = ambilAngka(formData, "id");

    await jalankan(
        "/pegawai",
        "Peminjaman disetujui, stok berkurang 1.",
        async () => {
            await dalamTransaksi(async (koneksi) => {
                const permohonan = await koneksi.query(
                    "SELECT buku_id FROM peminjaman WHERE id = $1 AND status = 'Menunggu Konfirmasi' FOR UPDATE",
                    [id]
                );
                if (!permohonan.rows[0]) {
                    throw new Error(
                        "Permohonan tidak ditemukan atau sudah diproses."
                    );
                }

                const buku = await koneksi.query(
                    "UPDATE buku SET stok_tersedia = stok_tersedia - 1 WHERE id = $1 AND stok_tersedia > 0 RETURNING durasi_pinjam_hari",
                    [permohonan.rows[0].buku_id]
                );

                if (!buku.rows[0]) {
                    throw new Error(
                        "Stok buku habis, permohonan tidak dapat disetujui."
                    );
                }

                await koneksi.query(
                    `UPDATE peminjaman
                    SET status = 'Sedang Dipinjam',
                        tanggal_pinjam = CURRENT_DATE,
                        jatuh_tempo = CURRENT_DATE + $2::int
                    WHERE id = $1`,
                    [id, buku.rows[0].durasi_pinjam_hari]
                );

                await catatNotifPeminjaman(
                    koneksi,
                    id,
                    "Peminjaman Anda disetujui. Selamat membaca!"
                );
            });
        }
    );
}

export async function tolakPinjam(formData) {
    await wajibPeran("Pegawai", "Admin");
    const id = ambilAngka(formData, "id");
    const alasan = ambilTeks(formData, "alasan");

    await jalankan("/pegawai", "Permohonan ditolak.", async () => {
        if (!alasan) {
            throw new Error("Alasan penolakan wajib diisi.");
        }

        const hasil = await pool.query(
            "UPDATE peminjaman SET status = 'Ditolak', alasan_penolakan = $2 WHERE id = $1 AND status = 'Menunggu Konfirmasi'",
            [id, alasan]
        );
        if (hasil.rowCount === 0) {
            throw new Error("Permohonan tidak ditemukan atau sudah diproses.");
        }

        await catatNotifPeminjaman(
            pool,
            id,
            "Permohonan peminjaman ditolak: " + alasan
        );
    });
}

const TIPE_BUKTI = ["image/jpeg", "image/png", "image/webp"];
const BATAS_BUKTI = 2 * 1024 * 1024;

export async function ajukanBayarDenda(formData) {
    const sesi = await wajibPeran("Mahasiswa");
    const peminjamanId = ambilAngka(formData, "peminjaman_id");
    const metode = ambilTeks(formData, "metode");
    const berkas = formData.get("bukti");

    await jalankan(
        "/mahasiswa",
        "Bukti pembayaran terkirim. Menunggu verifikasi petugas.",
        async () => {
            if (!["QRIS", "Transfer"].includes(metode)) {
                throw new Error("Metode pembayaran tidak valid.");
            }

            if (!berkas || typeof berkas !== "object" || berkas.size === 0) {
                throw new Error("Unggah foto bukti pembayaran terlebih dahulu.");
            }

            if (!TIPE_BUKTI.includes(berkas.type)) {
                throw new Error("Bukti harus berformat JPG, PNG, atau WEBP.");
            }

            if (berkas.size > BATAS_BUKTI) {
                throw new Error("Ukuran bukti maksimal 2 MB.");
            }

            const data = Buffer.from(await berkas.arrayBuffer());

            await dalamTransaksi(async (koneksi) => {
                const hasil = await koneksi.query(
                    `SELECT p.id,
                            CASE WHEN p.status = 'Sedang Dipinjam'
                                THEN GREATEST(0, CURRENT_DATE - p.jatuh_tempo) * b.denda_per_hari
                                ELSE p.denda_total END AS denda
                    FROM peminjaman p
                    JOIN buku b ON b.id = p.buku_id
                    WHERE p.id = $1
                        AND p.pengguna_id = $2
                        AND p.bukti_id IS NULL
                        AND (p.status = 'Sedang Dipinjam' OR p.status_denda = 'Tertunggak')
                    FOR UPDATE OF p`,
                    [peminjamanId, sesi.id]
                );

                const transaksi = hasil.rows[0];
                const nominal = Number(transaksi?.denda);
                if (!transaksi || !Number.isFinite(nominal) || nominal <= 0) {
                    throw new Error(
                        "Denda tidak ditemukan, sudah dibayar, atau bukti sedang menunggu verifikasi."
                    );
                }

                const bukti = await koneksi.query(
                    `INSERT INTO bukti_bayar (pengguna_id, metode, nominal, data, tipe)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id`,
                    [sesi.id, metode, nominal, data, berkas.type]
                );

                const diperbarui = await koneksi.query(
                    `UPDATE peminjaman
                    SET bukti_id = $1
                    WHERE id = $2 AND pengguna_id = $3 AND bukti_id IS NULL`,
                    [bukti.rows[0].id, peminjamanId, sesi.id]
                );
                if (diperbarui.rowCount === 0) {
                    throw new Error("Bukti pembayaran tidak dapat dikaitkan ke peminjaman.");
                }
            });
        }
    );
}

export async function konfirmasiPengembalian(formData) {
    await wajibPeran("Pegawai", "Admin");
    const id = ambilAngka(formData, "id");

    await jalankan(
        "/pegawai",
        "Pengembalian dikonfirmasi, stok bertambah 1.",
        async () => {
            await dalamTransaksi(async (koneksi) => {
                const cek = await koneksi.query(
                    `SELECT p.bukti_id,
                            GREATEST(0, CURRENT_DATE - p.jatuh_tempo) * b.denda_per_hari AS denda
                    FROM peminjaman p
                    JOIN buku b ON b.id = p.buku_id
                    WHERE p.id = $1 AND p.status = 'Sedang Dipinjam'
                    FOR UPDATE OF p`,
                    [id]
                );

                if (!cek.rows[0]) {
                    throw new Error("Transaksi tidak ditemukan atau sudah selesai.");
                }

                const denda = cek.rows[0].denda;

                if (denda > 0 && !cek.rows[0].bukti_id) {
                    throw new Error(
                        "Mahasiswa belum mengunggah bukti pembayaran denda."
                    );
                }

                const hasil = await koneksi.query(
                    `UPDATE peminjaman
                    SET status = 'Selesai',
                        tanggal_kembali = CURRENT_DATE,
                        denda_total = $2::int,
                        status_denda = CASE WHEN $2::int > 0 THEN 'Lunas' ELSE 'Tidak Ada' END
                    WHERE id = $1
                    RETURNING buku_id`,
                    [id, denda]
                );

                await koneksi.query(
                    "UPDATE buku SET stok_tersedia = stok_tersedia + 1 WHERE id = $1",
                    [hasil.rows[0].buku_id]
                );

                await catatNotifPeminjaman(
                    koneksi,
                    id,
                    denda > 0
                        ? `Denda ${rupiah(denda)} tercatat dan dinyatakan lunas.`
                        : "Pengembalian buku dikonfirmasi."
                );
            });
        }
    );
}

export async function tolakBukti(formData) {
    await wajibPeran("Pegawai", "Admin");
    const id = ambilAngka(formData, "id");

    await jalankan(
        "/pegawai",
        "Bukti pembayaran ditolak. Mahasiswa diminta mengunggah ulang.",
        async () => {
            const hasil = await pool.query(
                `UPDATE peminjaman
                SET bukti_id = NULL
                WHERE id = $1
                    AND bukti_id IS NOT NULL
                    AND (status = 'Sedang Dipinjam' OR status_denda = 'Tertunggak')`,
                [id]
            );

            if (hasil.rowCount === 0) {
                throw new Error("Bukti pembayaran tidak ditemukan.");
            }

            await catatNotifPeminjaman(
                pool,
                id,
                "Bukti pembayaran denda ditolak, silakan unggah ulang bukti yang jelas."
            );
        }
    );
}

export async function catatDendaLunas(formData) {
    await wajibPeran("Pegawai", "Admin");
    const id = ambilAngka(formData, "id");

    await jalankan("/pegawai", "Denda dicatat lunas.", async () => {
        const hasil = await pool.query(
            `UPDATE peminjaman
            SET status_denda = 'Lunas'
            WHERE id = $1 AND status_denda = 'Tertunggak' AND bukti_id IS NOT NULL`,
            [id]
        );

        if (hasil.rowCount === 0) {
            throw new Error(
                "Denda tidak ditemukan atau mahasiswa belum mengunggah bukti pembayaran."
            );
        }

        await catatNotifPeminjaman(pool, id, "Denda Anda sudah dicatat lunas.");
    });
}

export async function putuskanPerpanjangan(formData) {
    await wajibPeran("Pegawai", "Admin");
    const id = ambilAngka(formData, "id");
    const setuju = ambilTeks(formData, "keputusan") === "setuju";

    await jalankan(
        "/pegawai",
        setuju ? "Perpanjangan disetujui." : "Perpanjangan ditolak.",
        async () => {
            const hasil = setuju
                ? await pool.query(
                    `UPDATE peminjaman p
                    SET status_perpanjangan = 'Disetujui',
                        jatuh_tempo = p.jatuh_tempo + b.durasi_pinjam_hari
                    FROM buku b
                    WHERE b.id = p.buku_id
                    AND p.id = $1
                    AND p.status_perpanjangan = 'Diajukan'`,
                    [id]
                )
                : await pool.query(
                    "UPDATE peminjaman SET status_perpanjangan = 'Ditolak' WHERE id = $1 AND status_perpanjangan = 'Diajukan'",
                    [id]
                );

            if (hasil.rowCount === 0) {
                throw new Error("Pengajuan tidak ditemukan atau sudah diproses.");
            }

            await catatNotifPeminjaman(
                pool,
                id,
                setuju
                ? "Perpanjangan disetujui, jatuh tempo diperbarui."
                : "Perpanjangan ditolak."
            );
        }
    );
}

export async function beriUlasan(formData) {
    const sesi = await wajibPeran("Mahasiswa");
    const peminjamanId = ambilAngka(formData, "peminjaman_id");
    const rating = ambilAngka(formData, "rating");
    const komentar = ambilTeks(formData, "komentar");

    await jalankan(
        "/mahasiswa",
        "Terima kasih, ulasan Anda tersimpan.",
        async () => {
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                throw new Error("Rating harus antara 1 sampai 5.");
            }
            if (!komentar) {
                throw new Error("Komentar ulasan wajib diisi.");
            }

            const hasil = await pool.query(
                `INSERT INTO ulasan (pengguna_id, buku_id, peminjaman_id, rating, komentar)
                SELECT pengguna_id, buku_id, id, $3, $4
                FROM peminjaman
                WHERE id = $1
                AND pengguna_id = $2
                AND status = 'Selesai'
                ON CONFLICT (peminjaman_id)
                DO UPDATE SET rating = EXCLUDED.rating, komentar = EXCLUDED.komentar`,
                [peminjamanId, sesi.id, rating, komentar]
            );
            if (hasil.rowCount === 0) {
                throw new Error(
                "Ulasan hanya dapat diberikan untuk buku yang sudah selesai dipinjam."
                );
            }
        }
    );
}

export async function hapusUlasan(formData) {
    const sesi = await wajibPeran("Mahasiswa", "Pegawai", "Admin");
    const ulasanId = ambilAngka(formData, "id");
    const kembali = ambilTeks(formData, "kembali");
    const jalurKembali = kembali.startsWith("/") && !kembali.startsWith("//") ? kembali : "/mahasiswa";

    await jalankan(jalurKembali, "Ulasan dihapus.", async () => {
        const hasil = await pool.query(
            `DELETE FROM ulasan
             WHERE id = $1
               AND ($2::boolean OR pengguna_id = $3)`,
            [ulasanId, sesi.peran !== "Mahasiswa", sesi.id]
        );
        if (hasil.rowCount === 0) {
            throw new Error("Ulasan tidak ditemukan atau bukan milik Anda.");
        }
    });
}

export async function tandaiNotifDibaca() {
    const sesi = await wajibPeran("Mahasiswa");
    await pool.query(
        "UPDATE notifikasi SET dibaca = TRUE WHERE pengguna_id = $1",
        [sesi.id]
    );

    await jalankan(
        "/mahasiswa",
        "Semua notifikasi ditandai sudah dibaca.",
        async () => {}
    );
}