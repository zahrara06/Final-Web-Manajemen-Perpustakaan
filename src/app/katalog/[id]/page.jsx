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
    `SELECT u.id,
            u.pengguna_id,
            u.rating,
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

      <section className="grid items-start gap-8 rounded-[24px] border-[2.5px] border-biru-tua bg-white p-[clamp(1rem,3vw,2rem)] shadow-keras md:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] md:gap-10">
        <div className="mx-auto w-full max-w-[280px] md:mx-0">
          <Sampul buku={buku} />
        </div>

        <div className="min-w-0">
          <Badge>{buku.nama_kategori}</Badge>

          <h1 className="my-2.5 text-[clamp(2rem,4vw,3.8rem)]">
            {buku.judul}
          </h1>

          <p className="inline-flex items-center gap-2 rounded-full bg-kuning-muda px-3 py-1">
            <Bintang nilai={buku.rata_rating} /> ({buku.jumlah_ulasan} ulasan)
          </p>

          <dl className="my-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-biru-muda bg-biru-muda/30 px-4 py-2.5">
              <dt className="text-sm font-bold text-biru">Penulis</dt>

              <dd className="break-words font-semibold">{buku.penulis}</dd>
            </div>

            <div className="rounded-xl border-2 border-biru-muda bg-biru-muda/30 px-4 py-2.5">
              <dt className="text-sm font-bold text-biru">Penerbit</dt>

              <dd className="break-words font-semibold">
                {buku.penerbit}, {buku.tahun_terbit}
              </dd>
            </div>

            <div className="rounded-xl border-2 border-biru-muda bg-biru-muda/30 px-4 py-2.5">
              <dt className="text-sm font-bold text-biru">ISBN</dt>

              <dd className="break-words font-semibold">{buku.isbn}</dd>
            </div>

            <div className="rounded-xl border-2 border-biru-muda bg-biru-muda/30 px-4 py-2.5">
              <dt className="text-sm font-bold text-biru">Stok tersedia</dt>

              <dd className="font-semibold">
                {buku.stok_tersedia} dari {buku.stok_total}
              </dd>
            </div>

            <div className="rounded-xl border-2 border-biru-muda bg-biru-muda/30 px-4 py-2.5">
              <dt className="text-sm font-bold text-biru">Maksimal pinjam</dt>

              <dd className="font-semibold">{buku.durasi_pinjam_hari} hari</dd>
            </div>

            <div className="rounded-xl border-2 border-biru-muda bg-biru-muda/30 px-4 py-2.5">
              <dt className="text-sm font-bold text-biru">
                Denda keterlambatan
              </dt>

              <dd className="font-semibold">
                {rupiah(buku.denda_per_hari)} per hari
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-3">{aksiPinjam}</div>
        </div>
      </section>

      <section className="rounded-[24px] border-[2.5px] border-biru-tua bg-white p-[clamp(1rem,3vw,2rem)] shadow-keras">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2>Ulasan Mahasiswa</h2>

          <Badge>{buku.jumlah_ulasan} ulasan</Badge>
        </div>

        {ulasan.rowCount === 0 && (
          <p className="rounded-xl border-2 border-dashed border-biru-muda bg-kuning-muda/50 p-5 text-center opacity-80">
            Belum ada ulasan untuk buku ini.
          </p>
        )}

        <div className="flex flex-wrap items-start gap-4">
          {ulasan.rows.map((u) => (
            <article
              key={u.id}
              className="grid w-full max-w-[36rem] content-start gap-2 rounded-xl border-2 border-biru-muda bg-white p-4 shadow-[3px_3px_0_#dbe7ff]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{u.nama_lengkap}</strong>

                <Bintang nilai={u.rating} />
              </div>

              {u.komentar.length > 140 ? (
                <details className="group">
                  <summary className="list-none cursor-pointer marker:content-none">
                    <span className="line-clamp-3 break-words group-open:hidden">
                      {u.komentar}
                    </span>

                    <span className="mt-1 inline-block font-semibold text-biru group-open:hidden">
                      Lainnya
                    </span>

                    <span className="hidden font-semibold text-biru group-open:inline">
                      Lebih sedikit
                    </span>
                  </summary>

                  <p className="mt-2 break-words">{u.komentar}</p>
                </details>
              ) : (
                <p className="break-words">{u.komentar}</p>
              )}

              <small>{formatTanggal(u.dibuat_pada)}</small>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
