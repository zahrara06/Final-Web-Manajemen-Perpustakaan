"use server";
import pool, { transaksi } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { keluar, rupiah, tgl } from "@/lib/util";
import { notif } from "@/lib/notif";

export async function ajukanPinjam(formData) {
    const user = await requireRole("mahasiswa");
    const bookId = Number(formData.get("book_id"));
    const balik = `/katalog/${bookId}`;

    const tunggak = await pool.query(
        "SELECT 1 FROM loans WHERE user_id=$1 AND denda_status='tertunggak' LIMIT 1",
        [user.id]
    );

    if (tunggak.rowCount > 0) {
        keluar(balik, "error", "Peminjaman diblokir: masih ada denda tertunggak.");
    }

    const { rows: [b] } = await pool.query(
        "SELECT stok_tersedia FROM books WHERE id=$1",
        [bookId]
    );

    if (!b) {
        keluar("/katalog", "error", "Buku tidak ditemukan.");
    }

    if (b.stok_tersedia <= 0) {
        keluar(balik, "error", "Stok buku habis. Silakan reservasi.");
    }

    const ada = await pool.query(
        "SELECT 1 FROM loans WHERE user_id=$1 AND book_id=$2 AND status IN ('menunggu','dipinjam')",
        [user.id, bookId]
    );

    if (ada.rowCount > 0) {
        keluar(balik, "error", "Anda sudah mengajukan/meminjam buku ini.");
    }

    await pool.query(
        "INSERT INTO loans (user_id, book_id) VALUES ($1,$2)",
        [user.id, bookId]
    );

    await pool.query(
        "UPDATE reservations SET status='selesai' WHERE user_id=$1 AND book_id=$2 AND status IN ('antre','diberitahu')",
        [user.id, bookId]
    );

    keluar(
        "/mahasiswa",
        "ok",
        "Pengajuan terkirim. Temui pegawai di meja sirkulasi untuk konfirmasi."
    );
}

export async function ajukanPerpanjang(formData) {
    const user = await requireRole("mahasiswa");
    const id = Number(formData.get("id"));

    const r = await pool.query(
        `UPDATE loans SET perpanjangan_status='diajukan'
         WHERE id=$1 AND user_id=$2 AND status='dipinjam' AND perpanjangan_status='tidak'`,
        [id, user.id]
    );

    if (r.rowCount === 0) {
        keluar("/mahasiswa", "error", "Perpanjangan tidak dapat diajukan.");
    }

    keluar("/mahasiswa", "ok", "Perpanjangan diajukan.");
}

export async function beriUlasan(formData) {
    const user = await requireRole("mahasiswa");
    const bookId = Number(formData.get("book_id"));
    const loanId = Number(formData.get("loan_id"));
    const rating = Number(formData.get("rating"));
    const komentar = String(formData.get("komentar") || "").trim();
    const balik = `/katalog/${bookId}`;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        keluar(balik, "error", "Rating harus 1-5.");
    }

    if (!komentar) {
        keluar(balik, "error", "Komentar wajib diisi.");
    }

    const ok = await pool.query(
        "SELECT 1 FROM loans WHERE id=$1 AND user_id=$2 AND book_id=$3 AND status='selesai'",
        [loanId, user.id, bookId]
    );

    if (ok.rowCount === 0) {
        keluar(balik, "error", "Anda hanya bisa mengulas buku yang sudah selesai dipinjam.");
    }

    await pool.query(
        `INSERT INTO reviews (user_id, book_id, loan_id, rating, komentar)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (loan_id)
         DO UPDATE SET rating=EXCLUDED.rating, komentar=EXCLUDED.komentar`,
        [user.id, bookId, loanId, rating, komentar]
    );

    keluar(balik, "ok", "Ulasan tersimpan.");
}

export async function reservasiBuku(formData) {
    const user = await requireRole("mahasiswa");
    const bookId = Number(formData.get("book_id"));
    const balik = `/katalog/${bookId}`;

    const { rows: [b] } = await pool.query(
        "SELECT stok_tersedia FROM books WHERE id=$1",
        [bookId]
    );

    if (!b) {
        keluar("/katalog", "error", "Buku tidak ditemukan.");
    }

    if (b.stok_tersedia > 0) {
        keluar(balik, "error", "Stok masih tersedia, silakan ajukan pinjam.");
    }

    const ada = await pool.query(
        "SELECT 1 FROM reservations WHERE user_id=$1 AND book_id=$2 AND status IN ('antre','diberitahu')",
        [user.id, bookId]
    );

    if (ada.rowCount > 0) {
        keluar(balik, "error", "Anda sudah masuk antrean buku ini.");
    }

    await pool.query(
        "INSERT INTO reservations (user_id, book_id) VALUES ($1,$2)",
        [user.id, bookId]
    );

    keluar(balik, "ok", "Anda masuk antrean. Notifikasi akan dikirim saat buku tersedia.");
}

export async function batalReservasi(formData) {
    const user = await requireRole("mahasiswa");
    const id = Number(formData.get("id"));

    await pool.query(
        "UPDATE reservations SET status='batal' WHERE id=$1 AND user_id=$2 AND status IN ('antre','diberitahu')",
        [id, user.id]
    );

    keluar("/mahasiswa", "ok", "Reservasi dibatalkan.");
}

export async function putusPinjam(formData) {
    await requireRole("pegawai", "admin");

    const id = Number(formData.get("id"));
    const aksi = formData.get("aksi");
    const alasan = String(formData.get("alasan") || "").trim();

    if (aksi === "tolak") {
        if (!alasan) {
            keluar("/pegawai", "error", "Alasan penolakan wajib diisi.");
        }

        const r = await pool.query(
            `UPDATE loans l SET status='ditolak', alasan_tolak=$2
             FROM books b
             WHERE b.id=l.book_id AND l.id=$1 AND l.status='menunggu'
             RETURNING l.user_id, b.judul`,
            [id, alasan]
        );

        if (r.rowCount > 0) {
            await notif(
                pool,
                r.rows[0].user_id,
                `Pengajuan pinjam "${r.rows[0].judul}" ditolak: ${alasan}`
            );
        }

        keluar("/pegawai", "ok", "Pengajuan ditolak.");
    }

    const err = await transaksi(async (c) => {
        const { rows: [l] } = await c.query(
            `SELECT l.id, l.book_id, l.user_id, l.status, b.durasi_maks, b.judul
             FROM loans l
             JOIN books b ON b.id = l.book_id
             WHERE l.id=$1
             FOR UPDATE OF l`,
            [id]
        );

        if (!l || l.status !== "menunggu") {
            return "Transaksi tidak valid.";
        }

        const s = await c.query(
            "UPDATE books SET stok_tersedia = stok_tersedia - 1 WHERE id=$1 AND stok_tersedia > 0",
            [l.book_id]
        );

        if (s.rowCount === 0) {
            return "Stok buku habis.";
        }

        await c.query(
            `UPDATE loans SET status='dipinjam', tanggal_pinjam=CURRENT_DATE,
             jatuh_tempo = CURRENT_DATE + $2::int
             WHERE id=$1`,
            [id, l.durasi_maks]
        );

        await notif(
            c,
            l.user_id,
            `Peminjaman "${l.judul}" disetujui. Batas pengembalian ${l.durasi_maks} hari dari hari ini.`
        );

        return null;
    });

    if (err) {
        keluar("/pegawai", "error", err);
    }

    keluar("/pegawai", "ok", "Peminjaman disetujui, stok berkurang 1.");
}

export async function kembalikanBuku(formData) {
    await requireRole("pegawai", "admin");

    const id = Number(formData.get("id"));

    const err = await transaksi(async (c) => {
        const r = await c.query(
            `UPDATE loans l SET status='selesai', tanggal_kembali=CURRENT_DATE,
             denda_nominal = GREATEST(CURRENT_DATE - l.jatuh_tempo, 0) * b.denda_per_hari,
             denda_status = CASE
                 WHEN CURRENT_DATE > l.jatuh_tempo AND b.denda_per_hari > 0
                 THEN 'tertunggak'
                 ELSE 'tidak_ada'
             END
             FROM books b
             WHERE b.id = l.book_id AND l.id=$1 AND l.status='dipinjam'
             RETURNING l.book_id, l.user_id, l.denda_nominal, l.denda_status, b.judul`,
            [id]
        );

        if (r.rowCount === 0) {
            return "Transaksi tidak ditemukan.";
        }

        const x = r.rows[0];

        await c.query(
            "UPDATE books SET stok_tersedia = stok_tersedia + 1 WHERE id=$1",
            [x.book_id]
        );

        if (x.denda_status === "tertunggak") {
            await notif(
                c,
                x.user_id,
                `Denda baru tercatat untuk "${x.judul}": ${rupiah(x.denda_nominal)}.`
            );
        }

        const q = await c.query(
            `UPDATE reservations SET status='diberitahu'
             WHERE id = (
                 SELECT id FROM reservations
                 WHERE book_id=$1 AND status='antre'
                 ORDER BY created_at
                 LIMIT 1
             )
             RETURNING user_id`,
            [x.book_id]
        );

        if (q.rowCount > 0) {
            await notif(
                c,
                q.rows[0].user_id,
                `Buku "${x.judul}" kini tersedia. Segera ajukan peminjaman.`
            );
        }

        return null;
    });

    if (err) {
        keluar("/pegawai", "error", err);
    }

    keluar("/pegawai", "ok", "Buku dikembalikan. Stok bertambah 1.");
}

export async function lunasiDenda(formData) {
    await requireRole("pegawai", "admin");

    const id = Number(formData.get("id"));

    const r = await pool.query(
        `UPDATE loans l SET denda_status='lunas'
         FROM books b
         WHERE b.id=l.book_id AND l.id=$1 AND l.denda_status='tertunggak'
         RETURNING l.user_id, b.judul`,
        [id]
    );

    if (r.rowCount > 0) {
        await notif(
            pool,
            r.rows[0].user_id,
            `Denda "${r.rows[0].judul}" telah dilunasi. Anda dapat meminjam kembali.`
        );
    }

    keluar("/pegawai", "ok", "Denda ditandai lunas.");
}

export async function putusPerpanjang(formData) {
    await requireRole("pegawai", "admin");

    const id = Number(formData.get("id"));
    const aksi = formData.get("aksi");

    if (aksi === "setuju") {
        const r = await pool.query(
            `UPDATE loans l SET perpanjangan_status='disetujui',
             jatuh_tempo = l.jatuh_tempo + b.durasi_maks
             FROM books b
             WHERE b.id=l.book_id AND l.id=$1 AND l.perpanjangan_status='diajukan'
             RETURNING l.user_id, l.jatuh_tempo, b.judul`,
            [id]
        );

        if (r.rowCount > 0) {
            await notif(
                pool,
                r.rows[0].user_id,
                `Perpanjangan "${r.rows[0].judul}" disetujui. Jatuh tempo baru: ${tgl(r.rows[0].jatuh_tempo)}.`
            );
        }

        keluar("/pegawai", "ok", "Perpanjangan disetujui, jatuh tempo bertambah.");
    }

    const r = await pool.query(
        `UPDATE loans l SET perpanjangan_status='ditolak'
         FROM books b
         WHERE b.id=l.book_id AND l.id=$1 AND l.perpanjangan_status='diajukan'
         RETURNING l.user_id, b.judul`,
        [id]
    );

    if (r.rowCount > 0) {
        await notif(
            pool,
            r.rows[0].user_id,
            `Perpanjangan "${r.rows[0].judul}" ditolak.`
        );
    }

    keluar("/pegawai", "ok", "Perpanjangan ditolak.");
}
