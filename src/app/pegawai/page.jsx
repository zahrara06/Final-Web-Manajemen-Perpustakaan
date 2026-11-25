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
import Badge from "@/components/Badge";
import Pesan from "@/components/Pesan";
import { TOMBOL_HAPUS, TOMBOL_SETUJU } from "@/components/gayaTombol";

const KELAS_TOMBOL_AKSI =
    "inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-3 py-1 text-sm shadow-[2px_2px_0_#0b1b4d] bg-kuning";

const KELAS_TOMBOL_SUBMIT =
    "inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-5 py-2.5 shadow-tombol bg-kuning";

const KELAS_TABEL =
    "w-full border-separate border-spacing-0 overflow-hidden rounded-[14px] border-[2.5px] border-biru-tua bg-white shadow-keras [&_th]:bg-biru-tua [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-sm [&_th]:text-white [&_td]:border-t [&_td]:border-biru-muda [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:align-middle [&_td]:text-[0.92rem] [&_td_form]:inline-flex [&_td_form]:items-center [&_td_form]:gap-1.5 [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-kuning-muda/70";

const DASAR_QUERY = `
    FROM peminjaman p
    JOIN pengguna u ON u.id = p.pengguna_id
    JOIN buku b ON b.id = p.buku_id`;

export default async function DashboardPegawai({ searchParams }) {
    const sesi = await wajibPeran("Pegawai", "Admin");
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
            WHERE p.status = 'Sedang Dipinjam'
                AND p.pengembalian_diajukan = FALSE
                AND p.status_perpanjangan = 'Diajukan'
            ORDER BY p.id`
        ),
        pool.query(
            `SELECT p.id, p.jatuh_tempo, p.pengembalian_diajukan,
                    u.nama_lengkap, u.nomor_identitas, b.judul,
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
        <section className="anim-naik relative overflow-hidden rounded-[28px] border-[2.5px] border-biru-tua bg-biru-tua text-white shadow-hero">
            <div
                aria-hidden="true"
                className="anim-melayang absolute -right-12 -top-12 size-52 rounded-full bg-kuning"
            />
            <div
                aria-hidden="true"
                style={{ animationDelay: "1.2s" }}
                className="anim-melayang absolute right-40 top-28 size-16 rounded-full border-[6px] border-biru-muda/50"
            />
            <div
                aria-hidden="true"
                style={{ animationDelay: "2s" }}
                className="anim-melayang absolute right-12 top-40 size-8 rotate-12 rounded-md bg-biru"
            />

            <div className="relative grid gap-3 p-[clamp(1.5rem,4vw,3rem)]">
                <div className="w-fit">
                    <Badge>Pegawai</Badge>
                </div>
                <h1 className="text-[clamp(1.7rem,3.6vw,2.8rem)]">
                    Selamat datang,{" "}
                    <span className="text-kuning">{sesi.nama}</span>
                </h1>
                <p className="max-w-[50ch] text-biru-muda">
                    Kelola antrean peminjaman, perpanjangan, pengembalian,
                    dan denda perpustakaan.
                </p>
            </div>
        </section>
        <Pesan sp={sp} />

        <section>
            <h2 className="mb-4">Antrean Peminjaman</h2>

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
                            <td>
                                <div className="grid gap-1">
                                    <span>{p.judul}</span>
                                    {p.pengembalian_diajukan && (
                                        <Badge>Pengembalian diajukan</Badge>
                                    )}
                                </div>
                            </td>
                            <td>{p.stok_tersedia}</td>
                            <td>{formatTanggal(p.tanggal_ajuan)}</td>
                            <td>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <TombolBaris
                                        aksi={setujuiPinjam}
                                        id={p.id}
                                        label="Setujui"
                                        kelas={`${TOMBOL_SETUJU} w-24 justify-center whitespace-nowrap`}
                                    />

                                    <form action={tolakPinjam}>
                                        <input type="hidden" name="id" value={p.id} />
                                        <input
                                            name="alasan"
                                            placeholder="Alasan penolakan"
                                            required
                                            className="min-w-[180px] py-1 text-sm"
                                        />

                                        <button
                                            className={`${TOMBOL_HAPUS} w-24 justify-center whitespace-nowrap`}
                                        >
                                            ✕ Tolak
                                        </button>
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
            <h2 className="mb-4">Pengajuan Perpanjangan</h2>

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
                                        kelas={TOMBOL_HAPUS}
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
                                        label="Konfirmasi Pengembalian"
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
            <h2 className="mb-4">Denda Tertunggak</h2>

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