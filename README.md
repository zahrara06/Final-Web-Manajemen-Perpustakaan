# LiteraSpace — Manajemen Perpustakaan

LiteraSpace adalah aplikasi manajemen perpustakaan kampus untuk mengelola koleksi buku, pengumuman, peminjaman, pengembalian, dan denda. Aplikasi memiliki akses berbeda untuk Guest, Mahasiswa, Pegawai, dan Admin.

## Fitur

- **Guest:** melihat katalog buku, detail buku, dan pengumuman publik.
- **Mahasiswa:** mengajukan peminjaman dan perpanjangan, melihat status serta riwayat pinjaman, mengirim bukti pembayaran denda, menerima notifikasi, dan memberi ulasan buku.
- **Pegawai:** mengelola buku dan pengumuman, memproses permohonan pinjaman, mengonfirmasi pengembalian, serta memverifikasi pembayaran dan mencatat pelunasan denda.
- **Admin:** mengelola pengguna dan kategori, memantau transaksi, mengunduh laporan transaksi atau denda dalam format CSV, serta mengakses modul pengelolaan perpustakaan.

## Teknologi

- Next.js 16 dengan App Router
- React 19 dan JavaScript (JSX)
- Tailwind CSS 4
- PostgreSQL dengan `pg`
- Autentikasi sesi menggunakan JWT dan `jose`
- bcryptjs untuk pemrosesan kata sandi
- React Three Fiber dan Drei untuk adegan 3D di beranda

## Persyaratan

- Node.js 20.9 atau lebih baru
- npm
- Server PostgreSQL yang dapat diakses aplikasi

## Menjalankan Secara Lokal

1. Clone repositori dan masuk ke folder proyek.
2. Pasang dependensi:

   ```bash
   npm install
   ```

3. Buat file `.env.local` di folder utama proyek:

   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
   SESSION_SECRET=ganti-dengan-secret-acak-yang-panjang
   ```

   `DATABASE_URL` adalah alamat koneksi PostgreSQL. `SESSION_SECRET` digunakan untuk menandatangani sesi login dan wajib diisi. Jangan membagikan atau mengunggah isi `.env.local`.

4. Siapkan database PostgreSQL beserta skema dan data awal yang diperlukan. **Repositori ini tidak menyertakan berkas migrasi atau seed database**, sehingga database harus disiapkan terpisah.
5. Jalankan server pengembangan:

   ```bash
   npm run dev
   ```

6. Buka [http://localhost:3000](http://localhost:3000).

## Perintah

```bash
npm run dev    # Menjalankan server pengembangan
npm run lint   # Menjalankan ESLint
npm run build  # Membuat build produksi
npm start      # Menjalankan build produksi
```

Jalankan `npm run build` sebelum `npm start`.

## Rute Utama

| Rute | Keterangan |
| --- | --- |
| `/` | Beranda |
| `/katalog` | Katalog buku |
| `/katalog/[id]` | Detail buku dan ulasan |
| `/pengumuman` | Daftar pengumuman |
| `/pengumuman/[id]` | Detail pengumuman |
| `/login` dan `/register` | Masuk dan pendaftaran |
| `/lupa-password` | Reset kata sandi |
| `/mahasiswa` | Dashboard Mahasiswa |
| `/pegawai` | Dashboard Pegawai dan sirkulasi |
| `/admin` | Dashboard Admin |
| `/admin/users` | Manajemen pengguna |
| `/admin/kategori` | Manajemen kategori |
| `/admin/transaksi` | Monitoring transaksi |
| `/kelola/buku` | Manajemen buku |
| `/kelola/pengumuman` | Manajemen pengumuman |

Halaman pengelolaan dan transaksi dibatasi berdasarkan peran pengguna.

## Struktur Proyek

```text
src/
├── app/          Halaman, route handler API, dan server actions
├── components/   Komponen antarmuka yang digunakan ulang
├── lib/          Koneksi database, autentikasi, notifikasi, dan utilitas
└── middleware.js Middleware aplikasi
public/           Aset statis
```
