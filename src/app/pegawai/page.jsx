import Link from "next/link";
import Image from "next/image";
import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { rupiah, formatTanggal } from "@/lib/util";
import {
    setujuiPinjam,
    tolakPinjam,
    konfirmasiPengembalian,
    catatDendaLunas,
    putuskanPerpanjangan,
} from "@/app/actions/loans";
import Pesan from "@/components/Pesan";
import { TOMBOL_HAPUS, TOMBOL_SETUJU } from "@/components/gayaTombol";

const KELAS_KARTU_TAUTAN =
    "block border-[2.5px] border-biru-tua rounded-[18px] shadow-keras p-5 bg-white font-bold";

const KELAS_TOMBOL_AKSI =
    "inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-3 py-1 text-sm shadow-[2px_2px_0_#0b1b4d] bg-kuning";

const KELAS_TOMBOL_SUBMIT =
    "inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-5 py-2.5 shadow-tombol bg-kuning";

const KELAS_TABEL =
    "w-full border-separate border-spacing-0 overflow-hidden rounded-[14px] border-[2.5px] border-biru-tua bg-white shadow-keras [&_th]:bg-biru-tua [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-sm [&_th]:text-white [&_td]:border-t [&_td]:border-biru-muda [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:align-middle [&_td]:text-[0.92rem] [&_td_form]:inline-flex [&_td_form]:items-center [&_td_form]:gap-1.5";

const DASAR_QUERY = `
    FROM peminjaman p
    JOIN pengguna u ON u.id = p.pengguna_id
    JOIN buku b ON b.id = p.buku_id`;

export default async function DashboardPegawai({ searchParams }) {
    await wajibPeran("Pegawai", "Admin");
    const sp = await searchParams;
    const kata = (sp.q ?? "").trim();

    const [antrean, perpanjangan, sirkulasi, denda] = await Promise.all([
        pool.query(
            `SELECT p.id, p.tanggal_ajuan, u.nama_lengkap, u.nomor_identitas, b.judul, b.stok_tersedia
            ${DASAR_QUERY}
            WHERE p.status = 'Menunggu Konfirmasi'
            ORDER BY p.id`
        ),
        pool.query(
            `SELECT p.id, p.jatuh_tempo, u.nama_lengkap, b.judul, b.durasi_pinjam_hari
            ${DASAR_QUERY}
            WHERE p.status_perpanjangan = 'Diajukan'
            ORDER BY p.id`
        ),
        pool.query(
            `SELECT p.id, p.jatuh_tempo, u.nama_lengkap, u.nomor_identitas, b.judul,
                    p.bukti_id, bb.metode AS metode_bayar, bb.nominal AS nominal_bayar,
                    GREATEST(0, CURRENT_DATE - p.jatuh_tempo) * b.denda_per_hari AS denda_berjalan
            ${DASAR_QUERY}
            LEFT JOIN bukti_bayar bb ON bb.id = p.bukti_id
            WHERE p.status = 'Sedang Dipinjam'
                AND ($1::text = ''
                    OR u.nama_lengkap ILIKE '%' || $1 || '%'
                    OR u.nomor_identitas ILIKE '%' || $1 || '%'
                    OR b.judul ILIKE '%' || $1 || '%')
            ORDER BY p.jatuh_tempo`,
            [kata]
        ),
        pool.query(
            `SELECT p.id, p.denda_total, u.nama_lengkap, u.nomor_identitas, b.judul,
                    p.bukti_id, bb.metode AS metode_bayar, bb.nominal AS nominal_bayar
            ${DASAR_QUERY}
            LEFT JOIN bukti_bayar bb ON bb.id = p.bukti_id
            WHERE p.status_denda = 'Tertunggak'
            ORDER BY p.id`
        ),
    ]);

  return (
    <>
        <h1>Meja Sirkulasi</h1>
        <Pesan sp={sp} />

        <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">
            <Link href="/kelola/buku" className={KELAS_KARTU_TAUTAN}>
                Kelola Buku
                <span className="mt-0.5 block text-sm font-normal opacity-75">
                    Tambah, ubah, hapus koleksi dan stok
                </span>
            </Link>

            <Link href="/kelola/pengumuman" className={KELAS_KARTU_TAUTAN}>
                Kelola Pengumuman
                <span className="mt-0.5 block text-sm font-normal opacity-75">
                    Jadwal layanan dan agenda perpustakaan
                </span>
            </Link>
        </div>

        <section>
            <h2 className="mb-4">Antrean Peminjaman ({antrean.rowCount})</h2>

            <div className="overflow-x-auto">
                <table className={KELAS_TABEL}>
                    <thead>
                        <tr>
                            <th>Mahasiswa</th>
                            <th>Buku</th>
                            <th>Stok</th>
                            <th>Diajukan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {antrean.rows.map((p) => (
                        <tr key={p.id}>
                            <td>
                                {p.nama_lengkap}
                                <br />
                                <small>{p.nomor_identitas}</small>
                            </td>
                            <td>{p.judul}</td>
                            <td>{p.stok_tersedia}</td>
                            <td>{formatTanggal(p.tanggal_ajuan)}</td>
                            <td>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <TombolBaris
                                        aksi={setujuiPinjam}
                                        id={p.id}
                                        label="Setujui"
                                    />

                                    <form action={tolakPinjam}>
                                        <input type="hidden" name="id" value={p.id} />
                                        <input
                                            name="alasan"
                                            placeholder="Alasan penolakan"
                                            required
                                            className="min-w-[180px] py-1 text-sm"
                                        />

                                        <button className={TOMBOL_HAPUS}>✕ Tolak</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {antrean.rowCount === 0 && (
                        <tr>
                        <td colSpan={5} className="p-5 text-center opacity-70">
                            Tidak ada permohonan menunggu.
                        </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </section>

        <section>
            <h2 className="mb-4">Pengajuan Perpanjangan ({perpanjangan.rowCount})</h2>

            <div className="overflow-x-auto">
                <table className={KELAS_TABEL}>
                    <thead>
                        <tr>
                            <th>Mahasiswa</th>
                            <th>Buku</th>
                            <th>Jatuh tempo</th>
                            <th>Tambahan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {perpanjangan.rows.map((p) => (
                            <tr key={p.id}>
                            <td>{p.nama_lengkap}</td>
                            <td>{p.judul}</td>
                            <td>{formatTanggal(p.jatuh_tempo)}</td>
                            <td>+{p.durasi_pinjam_hari} hari</td>
                            <td>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <TombolBaris
                                        aksi={putuskanPerpanjangan}
                                        id={p.id}
                                        nilai="setuju"
                                        label="Setujui"
                                        kelas={TOMBOL_SETUJU}
                                    />
                                    <TombolBaris
                                        aksi={putuskanPerpanjangan}
                                        id={p.id}
                                        nilai="tolak"
                                        label="Tolak"
                                        kelas="{TOMBOL_HAPUS}"
                                    />
                                </div>
                            </td>
                            </tr>
                        ))}

                        {perpanjangan.rowCount === 0 && (
                            <tr>
                            <td colSpan={5} className="p-5 text-center opacity-70">
                                Tidak ada pengajuan perpanjangan.
                            </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>

        <section>
            <h2 className="mb-4">Pengembalian Buku</h2>

            <form className="flex flex-wrap items-center gap-3 [&_input]:w-auto [&_input]:min-w-[150px] [&_input]:flex-1 [&_select]:w-auto [&_select]:min-w-[150px] [&_select]:flex-1 mb-4">
            <input
                name="q"
                defaultValue={kata}
                placeholder="Cari nama, NIM, atau judul buku"
                aria-label="Cari transaksi aktif"
            />
            <button className={KELAS_TOMBOL_SUBMIT}>Cari</button>
            </form>

            <div className="overflow-x-auto">
                <table className={KELAS_TABEL}>
                    <thead>
                        <tr>
                            <th>Mahasiswa</th>
                            <th>Buku</th>
                            <th>Jatuh tempo</th>
                            <th>Denda berjalan</th>
                            <th>Bukti pembayaran</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sirkulasi.rows.map((p) => (
                            <tr key={p.id}>
                            <td>
                                {p.nama_lengkap}
                                <br />
                                <small>{p.nomor_identitas}</small>
                            </td>
                            <td>{p.judul}</td>
                            <td>{formatTanggal(p.jatuh_tempo)}</td>
                            <td>
                                {p.denda_berjalan > 0 ? rupiah(p.denda_berjalan) : "-"}
                            </td>
                            <td>
                                <PratinjauBukti
                                    buktiId={p.bukti_id}
                                    metode={p.metode_bayar}
                                    nominal={p.nominal_bayar}
                                    adaTagihan={p.denda_berjalan > 0}
                                />
                            </td>
                            <td>
                                {p.denda_berjalan > 0 && !p.bukti_id ? (
                                    <span className="font-semibold text-red-700">
                                        Menunggu bukti pembayaran
                                    </span>
                                ) : (
                                    <TombolBaris
                                        aksi={konfirmasiPengembalian}
                                        id={p.id}
                                        label="Konfirmasi Kembali"
                                        kelas={TOMBOL_SETUJU}
                                    />
                                )}
                            </td>
                            </tr>
                        ))}

                        {sirkulasi.rowCount === 0 && (
                            <tr>
                            <td colSpan={6} className="p-5 text-center opacity-70">
                                Tidak ada transaksi aktif yang cocok.
                            </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>

        <section>
            <h2 className="mb-4">Denda Tertunggak ({denda.rowCount})</h2>

            <div className="overflow-x-auto">
                <table className={KELAS_TABEL}>
                    <thead>
                        <tr>
                            <th>Mahasiswa</th>
                            <th>Buku</th>
                            <th>Denda</th>
                            <th>Bukti pembayaran</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {denda.rows.map((p) => (
                            <tr key={p.id}>
                            <td>
                                {p.nama_lengkap}
                                <br />
                                <small>{p.nomor_identitas}</small>
                            </td>
                            <td>{p.judul}</td>
                            <td>{rupiah(p.denda_total)}</td>
                            <td>
                                <PratinjauBukti
                                    buktiId={p.bukti_id}
                                    metode={p.metode_bayar}
                                    nominal={p.nominal_bayar}
                                    adaTagihan={p.denda_total > 0}
                                />
                            </td>
                            <td>
                                {p.bukti_id ? (
                                    <TombolBaris
                                        aksi={catatDendaLunas}
                                        id={p.id}
                                        label="Catat Lunas"
                                    />
                                ) : (
                                    <span className="font-semibold text-red-700">
                                        Menunggu bukti
                                    </span>
                                )}
                            </td>
                            </tr>
                        ))}

                        {denda.rowCount === 0 && (
                            <tr>
                            <td colSpan={5} className="p-5 text-center opacity-70">
                                Tidak ada denda tertunggak.
                            </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
        </>
    );
}

function TombolBaris({
    aksi,
    id,
    label,
    nilai,
    kelas = KELAS_TOMBOL_AKSI,
}) {
    return (
        <form action={aksi}>
        <input type="hidden" name="id" value={id} />
        <button
            className={kelas}
            name={nilai ? "keputusan" : undefined}
            value={nilai}
        >
            {label}
        </button>
        </form>
    );
}

function PratinjauBukti({ buktiId, metode, nominal, adaTagihan }) {
    if (!buktiId) {
        return <span>{adaTagihan ? "Belum ada bukti" : "-"}</span>;
    }

    return (
        <a
            href={`/api/bukti/${buktiId}`}
            target="_blank"
            rel="noreferrer"
            className="grid gap-1"
        >
            <Image
                src={`/api/bukti/${buktiId}`}
                alt="Foto bukti pembayaran"
                width={160}
                height={120}
                unoptimized
                className="h-24 w-36 rounded-lg border object-contain"
            />
            <span className="text-xs">
                {metode} - {rupiah(nominal)}
            </span>
        </a>
    );
}