DROP TABLE IF EXISTS bukti_bayar, sampul_buku, notifikasi, ulasan, peminjaman, pengumuman, buku, kategori, pengguna CASCADE;

-- ======================== STRUKTUR TABEL ========================

CREATE TABLE pengguna (
  id              SERIAL PRIMARY KEY,
  nama_lengkap    VARCHAR(100) NOT NULL,
  email           VARCHAR(100) NOT NULL UNIQUE,
  kata_sandi_hash TEXT         NOT NULL,
  peran           VARCHAR(20)  NOT NULL CHECK (peran IN ('Admin', 'Pegawai', 'Mahasiswa')),
  nomor_identitas VARCHAR(30)  NOT NULL UNIQUE,
  aktif           BOOLEAN      NOT NULL DEFAULT TRUE,
  foto            BYTEA,
  foto_tipe       VARCHAR(30),
  dibuat_pada     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE kategori (
  id        SERIAL PRIMARY KEY,
  nama      VARCHAR(80) NOT NULL UNIQUE,
  kode      VARCHAR(10) NOT NULL UNIQUE,
  deskripsi TEXT
);

CREATE TABLE buku (
  id                 SERIAL PRIMARY KEY,
  judul              VARCHAR(200) NOT NULL,
  isbn               VARCHAR(20)  NOT NULL UNIQUE,
  penulis            VARCHAR(120) NOT NULL,
  penerbit           VARCHAR(120) NOT NULL,
  tahun_terbit       INTEGER      NOT NULL,
  kategori_id        INTEGER      NOT NULL REFERENCES kategori (id),
  stok_total         INTEGER      NOT NULL CHECK (stok_total >= 0),
  stok_tersedia      INTEGER      NOT NULL CHECK (stok_tersedia >= 0),
  durasi_pinjam_hari INTEGER      NOT NULL CHECK (durasi_pinjam_hari >= 1),
  denda_per_hari     INTEGER      NOT NULL CHECK (denda_per_hari >= 0),
  gambar_sampul      TEXT,
  CHECK (stok_tersedia <= stok_total)
);

CREATE TABLE sampul_buku (
  buku_id INTEGER PRIMARY KEY REFERENCES buku (id) ON DELETE CASCADE,
  data    BYTEA NOT NULL,
  tipe    VARCHAR(30) NOT NULL
);

CREATE TABLE pengumuman (
  id            SERIAL PRIMARY KEY,
  judul         VARCHAR(200) NOT NULL,
  isi           TEXT         NOT NULL,
  kategori      VARCHAR(20)  NOT NULL CHECK (kategori IN ('Operasional', 'Layanan', 'Acara')),
  tanggal_rilis DATE         NOT NULL DEFAULT CURRENT_DATE,
  status        VARCHAR(20)  NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
  penulis_id    INTEGER REFERENCES pengguna (id) ON DELETE SET NULL
);

CREATE TABLE bukti_bayar (
  id          SERIAL PRIMARY KEY,
  pengguna_id INTEGER     NOT NULL REFERENCES pengguna (id) ON DELETE CASCADE,
  metode      VARCHAR(20) NOT NULL CHECK (metode IN ('QRIS', 'Transfer')),
  nominal     INTEGER     NOT NULL CHECK (nominal > 0),
  data        BYTEA       NOT NULL,
  tipe        VARCHAR(30) NOT NULL,
  dibuat_pada TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE peminjaman (
  id                  SERIAL PRIMARY KEY,
  pengguna_id         INTEGER NOT NULL REFERENCES pengguna (id) ON DELETE CASCADE,
  buku_id             INTEGER NOT NULL REFERENCES buku (id) ON DELETE CASCADE,
  status              VARCHAR(30) NOT NULL DEFAULT 'Menunggu Konfirmasi'
                      CHECK (status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam', 'Ditolak', 'Selesai')),
  alasan_penolakan    TEXT,
  tanggal_ajuan       TIMESTAMP NOT NULL DEFAULT NOW(),
  tanggal_pinjam      DATE,
  jatuh_tempo         DATE,
  tanggal_kembali     DATE,
  status_perpanjangan VARCHAR(30) NOT NULL DEFAULT 'Tidak Ada'
                      CHECK (status_perpanjangan IN ('Tidak Ada', 'Diajukan', 'Disetujui', 'Ditolak')),
  pengembalian_diajukan BOOLEAN NOT NULL DEFAULT FALSE,
  denda_total         INTEGER NOT NULL DEFAULT 0,
  status_denda        VARCHAR(20) NOT NULL DEFAULT 'Tidak Ada'
                      CHECK (status_denda IN ('Tidak Ada', 'Tertunggak', 'Lunas')),
  bukti_id            INTEGER REFERENCES bukti_bayar (id) ON DELETE SET NULL
);

CREATE TABLE ulasan (
  id            SERIAL PRIMARY KEY,
  pengguna_id   INTEGER NOT NULL REFERENCES pengguna (id) ON DELETE CASCADE,
  buku_id       INTEGER NOT NULL REFERENCES buku (id) ON DELETE CASCADE,
  peminjaman_id INTEGER NOT NULL UNIQUE REFERENCES peminjaman (id) ON DELETE CASCADE,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  komentar      TEXT    NOT NULL,
  dibuat_pada   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE notifikasi (
  id          SERIAL PRIMARY KEY,
  pengguna_id INTEGER NOT NULL REFERENCES pengguna (id) ON DELETE CASCADE,
  pesan       TEXT NOT NULL,
  dibaca      BOOLEAN NOT NULL DEFAULT FALSE,
  kunci       VARCHAR(80) UNIQUE,
  dibuat_pada TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_peminjaman_pengguna ON peminjaman (pengguna_id);
CREATE INDEX idx_peminjaman_buku ON peminjaman (buku_id);

ALTER TABLE peminjaman
ADD COLUMN IF NOT EXISTS pengembalian_diajukan BOOLEAN NOT NULL DEFAULT FALSE;

-- ======================== DATA CONTOH ========================

-- Akun contoh: admin123 / pegawai123 / mahasiswa123
INSERT INTO pengguna (nama_lengkap, email, kata_sandi_hash, peran, nomor_identitas) VALUES
  ('Admin LiteraSpace', 'admin@literaspace.ac.id', '$2a$10$eWhpYTfz8N7y1VjnMooWlefsK1n9RcMubW7nUt.Gld08kaZr.lfb2', 'Admin', 'ADM-001'),
  ('Pegawai Perpustakaan', 'pegawai@literaspace.ac.id', '$2a$10$jfukzfpHvFypinrU05P07.nf5XU1AIdOc5sfLJTt7szrBHbN.A4dO', 'Pegawai', 'PGW-001'),
  ('Mahasiswa Contoh', 'mahasiswa@student.literaspace.ac.id', '$2a$10$yAnzMmgMSYDu1xZ8qZ5OZOnnnIy5uzmFdDvWqX2w/6QxPcRHXv07K', 'Mahasiswa', '2026001'),
  ('Mahasiswa Berdenda', 'denda@student.literaspace.ac.id', '$2a$10$yAnzMmgMSYDu1xZ8qZ5OZOnnnIy5uzmFdDvWqX2w/6QxPcRHXv07K', 'Mahasiswa', '2026002');

INSERT INTO kategori (nama, kode, deskripsi) VALUES
  ('Teknologi Informasi', 'TI', 'Pemrograman, basis data, jaringan, dan rekayasa perangkat lunak'),
  ('Hukum', 'HK', 'Hukum perdata, pidana, dan tata negara'),
  ('Kedokteran', 'KD', 'Ilmu kedokteran dan kesehatan'),
  ('Sastra & Bahasa', 'SB', 'Novel, puisi, dan kajian bahasa');

-- Buku. Sampul diambil dari Open Library berdasarkan ISBN.
INSERT INTO buku (judul, isbn, penulis, penerbit, tahun_terbit, kategori_id, stok_total, stok_tersedia, durasi_pinjam_hari, denda_per_hari, gambar_sampul) VALUES
  ('Clean Code', '9780132350884', 'Robert C. Martin', 'Prentice Hall', 2008, (SELECT id FROM kategori WHERE kode='TI'), 5, 5, 14, 1500, 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg'),
  ('The Pragmatic Programmer', '9780135957059', 'David Thomas, Andrew Hunt', 'Addison-Wesley', 2019, (SELECT id FROM kategori WHERE kode='TI'), 4, 4, 14, 1500, 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg'),
  ('Introduction to Algorithms', '9780262033848', 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', 'MIT Press', 2009, (SELECT id FROM kategori WHERE kode='TI'), 3, 3, 14, 2000, 'https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg'),
  ('Design Patterns: Elements of Reusable Object-Oriented Software', '9780201633610', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 'Addison-Wesley', 1994, (SELECT id FROM kategori WHERE kode='TI'), 3, 3, 14, 1500, 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg'),
  ('The Concept of Law', '9780199644704', 'H. L. A. Hart', 'Oxford University Press', 2012, (SELECT id FROM kategori WHERE kode='HK'), 4, 4, 10, 1000, 'https://covers.openlibrary.org/b/isbn/9780199644704-L.jpg'),
  ('Guyton and Hall Textbook of Medical Physiology', '9780323597128', 'John E. Hall, Michael E. Hall', 'Elsevier', 2020, (SELECT id FROM kategori WHERE kode='KD'), 3, 3, 7, 2000, 'https://covers.openlibrary.org/b/isbn/9780323597128-L.jpg'),
  ('Laut Bercerita', '9786024246945', 'Leila S. Chudori', 'Kepustakaan Populer Gramedia', 2017, (SELECT id FROM kategori WHERE kode='SB'), 4, 4, 14, 500, 'https://covers.openlibrary.org/b/isbn/9786024246945-L.jpg'),
  ('Laskar Pelangi', '9789793062792', 'Andrea Hirata', 'Bentang Pustaka', 2005, (SELECT id FROM kategori WHERE kode='SB'), 5, 5, 14, 500, 'https://covers.openlibrary.org/b/isbn/9789793062792-L.jpg'),
  ('Harry Potter and the Philosopher''s Stone', '9781408855652', 'J. K. Rowling', 'Bloomsbury', 1997, (SELECT id FROM kategori WHERE kode='SB'), 5, 5, 14, 500, 'https://covers.openlibrary.org/b/isbn/9781408855652-L.jpg');

INSERT INTO pengumuman (judul, isi, kategori, tanggal_rilis, status, penulis_id) VALUES
  ('Jadwal Layanan Selama Libur Semester', 'Layanan sirkulasi buka pukul 09.00-15.00 selama libur semester. Pengembalian buku tetap dilayani di meja sirkulasi.', 'Operasional', CURRENT_DATE - 2, 'Published', (SELECT id FROM pengguna WHERE email = 'pegawai@literaspace.ac.id')),
  ('Koleksi Baru: Teknologi Informasi dan Novel 2026', 'Perpustakaan menambah judul baru bidang pemrograman, algoritma, dan novel populer. Silakan telusuri di katalog.', 'Layanan', CURRENT_DATE - 5, 'Published', (SELECT id FROM pengguna WHERE email = 'pegawai@literaspace.ac.id')),
  ('Bedah Buku: Laskar Pelangi', 'Diskusi terbuka bersama penulis dan dosen Sastra, Jumat pukul 13.00 di ruang baca lantai 2.', 'Acara', CURRENT_DATE - 1, 'Published', (SELECT id FROM pengguna WHERE email = 'pegawai@literaspace.ac.id')),
  ('Rencana Pengadaan Semester Depan', 'Draf daftar pengadaan buku, belum diumumkan.', 'Layanan', CURRENT_DATE, 'Draft', (SELECT id FROM pengguna WHERE email = 'pegawai@literaspace.ac.id'));

-- ======================== DATA TRANSAKSI ========================

-- Riwayat selesai (mengisi peringkat buku terpopuler dan rating)
INSERT INTO peminjaman (pengguna_id, buku_id, status, tanggal_pinjam, jatuh_tempo, tanggal_kembali)
SELECT p.id, b.id, 'Selesai', CURRENT_DATE - 30, CURRENT_DATE - 20, CURRENT_DATE - 22
FROM pengguna p CROSS JOIN buku b
WHERE p.email IN ('mahasiswa@student.literaspace.ac.id', 'denda@student.literaspace.ac.id')
  AND b.isbn IN ('9780132350884', '9789793062792', '9781408855652');

INSERT INTO peminjaman (pengguna_id, buku_id, status, tanggal_pinjam, jatuh_tempo, tanggal_kembali)
SELECT p.id, b.id, 'Selesai', CURRENT_DATE - 40, CURRENT_DATE - 30, CURRENT_DATE - 31
FROM pengguna p CROSS JOIN buku b
WHERE p.email = 'mahasiswa@student.literaspace.ac.id'
  AND b.isbn IN ('9780135957059', '9780262033848', '9786024246945');

INSERT INTO ulasan (pengguna_id, buku_id, peminjaman_id, rating, komentar)
SELECT pengguna_id, buku_id, id, 3 + (buku_id % 3), 'Bacaan yang bagus dan mudah dipahami.'
FROM peminjaman
WHERE status = 'Selesai'
  AND pengguna_id = (SELECT id FROM pengguna WHERE email = 'mahasiswa@student.literaspace.ac.id');

-- Pinjaman aktif lewat jatuh tempo 3 hari (denda berjalan Rp 6.000, belum ada bukti bayar)
INSERT INTO peminjaman (pengguna_id, buku_id, status, tanggal_pinjam, jatuh_tempo)
SELECT (SELECT id FROM pengguna WHERE email = 'mahasiswa@student.literaspace.ac.id'), id, 'Sedang Dipinjam', CURRENT_DATE - 10, CURRENT_DATE - 3
FROM buku WHERE isbn = '9780323597128';
UPDATE buku SET stok_tersedia = stok_tersedia - 1 WHERE isbn = '9780323597128';

-- Pinjaman aktif jatuh tempo besok (memicu notifikasi pengingat H-1 saat dashboard dibuka)
INSERT INTO peminjaman (pengguna_id, buku_id, status, tanggal_pinjam, jatuh_tempo)
SELECT (SELECT id FROM pengguna WHERE email = 'mahasiswa@student.literaspace.ac.id'), id, 'Sedang Dipinjam', CURRENT_DATE - 13, CURRENT_DATE + 1
FROM buku WHERE isbn = '9780201633610';
UPDATE buku SET stok_tersedia = stok_tersedia - 1 WHERE isbn = '9780201633610';

-- Denda tertunggak (memicu pemblokiran peminjaman baru)
INSERT INTO peminjaman (pengguna_id, buku_id, status, tanggal_pinjam, jatuh_tempo, tanggal_kembali, denda_total, status_denda)
SELECT (SELECT id FROM pengguna WHERE email = 'denda@student.literaspace.ac.id'), id, 'Selesai', CURRENT_DATE - 28, CURRENT_DATE - 18, CURRENT_DATE - 3, 15000, 'Tertunggak'
FROM buku WHERE isbn = '9780199644704';