import "server-only";
import pool from "@/lib/db";

export async function catatNotifPeminjaman(koneksi, peminjamanId, pesan) {
    await koneksi.query(
        `INSERT INTO notifikasi (pengguna_id, pesan)
         SELECT p.pengguna_id, $2 || ' (' || b.judul || ')'
         FROM peminjaman p
         JOIN buku b ON b.id = p.buku_id
         WHERE p.id = $1`,
        [peminjamanId, pesan]
    );
}

export async function buatPengingatJatuhTempo(penggunaId) {
    await pool.query(
        `INSERT INTO notifikasi (pengguna_id, pesan, kunci)
         SELECT p.pengguna_id,
                'Pengingat: "' || b.judul || '" jatuh tempo besok (' || to_char(p.jatuh_tempo, 'DD/MM/YYYY') || ').',
                'h1-' || p.id || '-' || p.jatuh_tempo
         FROM peminjaman p
         JOIN buku b ON b.id = p.buku_id
         WHERE p.pengguna_id = $1
           AND p.status = 'Sedang Dipinjam'
           AND p.jatuh_tempo = CURRENT_DATE + 1
         ON CONFLICT (kunci) DO NOTHING`,
        [penggunaId]
    );
}

export async function sinkronkanNotifDenda(penggunaId, daftarDenda) {
    const pesan = daftarDenda.map((notifikasi) => notifikasi.pesan);
    const kunci = daftarDenda.map((notifikasi) => notifikasi.kunci);

    await pool.query(
        `INSERT INTO notifikasi (pengguna_id, pesan, kunci)
         SELECT $1, sumber.pesan, sumber.kunci
         FROM UNNEST($2::text[], $3::text[]) AS sumber(pesan, kunci)
         ON CONFLICT (kunci) DO UPDATE SET pesan = EXCLUDED.pesan`,
        [penggunaId, pesan, kunci]
    );

    await pool.query(
        `DELETE FROM notifikasi
         WHERE pengguna_id = $1
           AND kunci LIKE 'denda-status-%'
           AND NOT (kunci = ANY($2::text[]))`,
        [penggunaId, kunci]
    );
}

export async function ambilNotif(penggunaId, batas = 8) {
    const { rows } = await pool.query(
        `SELECT id, pesan, dibaca, dibuat_pada
         FROM notifikasi
         WHERE pengguna_id = $1
         ORDER BY id DESC
         LIMIT $2`,
        [penggunaId, batas]
    );

    return rows;
}
