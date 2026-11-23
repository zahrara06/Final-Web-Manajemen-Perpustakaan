import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { ambilSesi } from "@/lib/auth";
import { rupiah, formatTanggal } from "@/lib/util";
import { ajukanPinjam } from "@/app/actions/loans";
import { Sampul, Bintang } from "@/components/BookCard";
import Pesan from "@/components/Pesan";
import Badge from "@/components/Badge";

const KELAS_TOMBOL =
  "inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-5 py-2.5 shadow-tombol bg-kuning";

export default async function DetailBuku({ params, searchParams }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const { rows } = await pool.query(
    `SELECT b.*,
            k.nama AS nama_kategori,
            COALESCE(ROUND(AVG(u.rating), 1), 0) AS rata_rating,
            COUNT(u.id) AS jumlah_ulasan
     FROM buku b
     JOIN kategori k ON k.id = b.kategori_id
     LEFT JOIN ulasan u ON u.buku_id = b.id
     WHERE b.id = $1
     GROUP BY b.id, k.nama`,
    [id]
  );
  const buku = rows[0];
  if (!buku) notFound();

  const ulasan = await pool.query(
    `SELECT u.rating,
            u.komentar,
            u.dibuat_pada,
            p.nama_lengkap
     FROM ulasan u
     JOIN pengguna p ON p.id = u.pengguna_id
     WHERE u.buku_id = $1
     ORDER BY u.dibuat_pada DESC`,
    [id]
  );

  const sesi = await ambilSesi();
  let terblokirDenda = false;

  if (sesi?.peran === "Mahasiswa") {
    const denda = await pool.query(
      `SELECT 1
       FROM peminjaman
       WHERE pengguna_id = $1
         AND status_denda = 'Tertunggak'
       LIMIT 1`,
      [sesi.id]
    );
    terblokirDenda = denda.rowCount > 0;
  }

  let aksiPinjam;
  if (!sesi) {
    aksiPinjam = (
      <Link href={`/login?dari=/katalog/${id}`} className={KELAS_TOMBOL}>
        Masuk sebagai Mahasiswa untuk meminjam
      </Link>
    );
  } else if (sesi.peran !== "Mahasiswa") {
    aksiPinjam = (
      <p className="rounded-xl border-2 px-4 py-3 font-semibold border-biru-tua bg-kuning-muda">
        Peminjaman hanya tersedia untuk akun Mahasiswa.
      </p>
    );
  } else if (terblokirDenda) {
    aksiPinjam = (
      <button type="button" className={KELAS_TOMBOL} disabled>
        Diblokir: ada denda tertunggak
      </button>
    );
  } else if (buku.stok_tersedia < 1) {
    aksiPinjam = (
      <button type="button" className={KELAS_TOMBOL} disabled>
        Stok sedang habis
      </button>
    );
  } else {
    aksiPinjam = (
      <form action={ajukanPinjam}>
        <input type="hidden" name="buku_id" value={buku.id} />
        <button type="submit" className={KELAS_TOMBOL}>
          Ajukan Pinjam
        </button>
      </form>
    );
  }

  const sp = await searchParams;

  return (
    <>
      <Pesan sp={sp} />
      <section className="grid items-start gap-8 md:grid-cols-[280px_1fr]">
        <Sampul buku={buku} />
        <div>
          <Badge>{buku.nama_kategori}</Badge>
          <h1 className="my-2.5">{buku.judul}</h1>
          <p>
            <Bintang nilai={buku.rata_rating} /> ({buku.jumlah_ulasan} ulasan)
          </p>
          <dl className="my-4 grid grid-cols-[max-content_1fr] gap-x-5 gap-y-1.5 [&_dt]:font-bold">
            <dt>Penulis</dt>
            <dd>{buku.penulis}</dd>
            <dt>Penerbit</dt>
            <dd>
              {buku.penerbit}, {buku.tahun_terbit}
            </dd>
            <dt>ISBN</dt>
            <dd>{buku.isbn}</dd>
            <dt>Stok tersedia</dt>
            <dd>
              {buku.stok_tersedia} dari {buku.stok_total}
            </dd>
            <dt>Maksimal pinjam</dt>
            <dd>{buku.durasi_pinjam_hari} hari</dd>
            <dt>Denda keterlambatan</dt>
            <dd>{rupiah(buku.denda_per_hari)} per hari</dd>
          </dl>
          {aksiPinjam}
        </div>
      </section>

      <section>
        <h2 className="mb-4">Ulasan Mahasiswa</h2>
        {ulasan.rowCount === 0 && (
          <p className="p-5 text-center opacity-70">
            Belum ada ulasan untuk buku ini.
          </p>
        )}
        {ulasan.rows.map((u, i) => (
          <div
            key={i}
            className="grid gap-0.5 border-b-2 border-dashed border-biru-muda py-3.5"
          >
            <strong>
              {u.nama_lengkap} <Bintang nilai={u.rating} />
            </strong>
            <span>{u.komentar}</span>
            <small>{formatTanggal(u.dibuat_pada)}</small>
          </div>
        ))}
      </section>
    </>
  );
}