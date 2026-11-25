import Link from "next/link";
import pool from "@/lib/db";
import { wajibPeran } from "@/lib/auth";
import { rupiah, formatTanggal } from "@/lib/util";
import { buatPengingatJatuhTempo, ambilNotif } from "@/lib/notif";
import {
    ajukanPerpanjangan,
    beriUlasan,
    hapusUlasan,
    tandaiNotifDibaca,
} from "@/app/actions/loans";
import Badge from "@/components/Badge";
import Field from "@/components/Field";
import Pesan from "@/components/Pesan";
import TombolHapus from "@/components/TombolHapus";

const KELAS_KARTU =
    "block border-[2.5px] border-biru-tua rounded-[18px] shadow-keras p-5 bg-white";

const KELAS_TOMBOL_AKSI =
    "inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-3 py-1 text-sm shadow-[2px_2px_0_#0b1b4d] bg-kuning";

const KELAS_TOMBOL_SUBMIT =
    "inline-block cursor-pointer text-center font-bold text-biru-tua border-[2.5px] border-biru-tua rounded-xl transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#0b1b4d] disabled:cursor-not-allowed disabled:opacity-55 px-5 py-2.5 shadow-tombol bg-kuning";

const KELAS_TABEL =
    "w-full border-separate border-spacing-0 overflow-hidden rounded-[14px] border-[2.5px] border-biru-tua bg-white shadow-keras [&_th]:bg-biru-tua [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-sm [&_th]:text-white [&_td]:border-t [&_td]:border-biru-muda [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:align-middle [&_td]:text-[0.92rem] [&_td_form]:inline-flex [&_td_form]:items-center [&_td_form]:gap-1.5";

const STATUS_AKTIF = ["Menunggu Konfirmasi", "Sedang Dipinjam"];
const OPSI_RATING = [5, 4, 3, 2, 1];

export default async function DashboardMahasiswa({ searchParams }) {
    const sesi = await wajibPeran("Mahasiswa");
    const sp = await searchParams;

    await buatPengingatJatuhTempo(sesi.id);
    const notifikasi = await ambilNotif(sesi.id);

    const { rows } = await pool.query(
        `SELECT p.*, b.judul,
                CASE WHEN p.status = 'Sedang Dipinjam'
                    THEN GREATEST(0, CURRENT_DATE - p.jatuh_tempo) * b.denda_per_hari
                    ELSE p.denda_total END AS denda_saat_ini,
                u.id AS ulasan_id, u.rating AS rating_saya, u.komentar AS komentar_saya
        FROM peminjaman p
        JOIN buku b ON b.id = p.buku_id
        LEFT JOIN ulasan u ON u.peminjaman_id = p.id
        WHERE p.pengguna_id = $1
        ORDER BY p.id DESC`,
        [sesi.id]
    );

    const aktif = rows.filter((p) => STATUS_AKTIF.includes(p.status));
    const riwayat = rows.filter((p) => !STATUS_AKTIF.includes(p.status));
    const tertunggak = rows.filter((p) => p.status_denda === "Tertunggak");

    const totalTertunggak = tertunggak.reduce(
        (jumlah, p) => jumlah + p.denda_saat_ini,
        0
    );
    const dendaBerjalan = aktif.reduce(
        (jumlah, p) => jumlah + (p.status === "Sedang Dipinjam" ? p.denda_saat_ini : 0),
        0
    );
    const sedangDiulas = riwayat.find(
        (p) => String(p.id) === sp.ulas && p.status === "Selesai"
    );
    const adaNotifBelumDibaca = notifikasi.some((n) => !n.dibaca);

    return (
        <>
        <h1>Halo, {sesi.nama}</h1>
        <Pesan sp={sp} />

        {(tertunggak.length > 0 || dendaBerjalan > 0) && (
            <section className="block border-[2.5px] border-biru-tua rounded-[18px] shadow-keras p-5 bg-kuning bg-[repeating-linear-gradient(135deg,transparent_0_14px,rgba(11,27,77,0.07)_14px_28px)]">
            <h2>Status Denda</h2>

            {tertunggak.length > 0 && (
                <p>
                Denda tertunggak <strong>{rupiah(totalTertunggak)}</strong>.
                Pengajuan pinjaman baru <strong>diblokir</strong> sampai petugas
                mencatat pelunasan.
                </p>
            )}

            {dendaBerjalan > 0 && (
                <p>
                Denda berjalan dari buku yang terlambat:{" "}
                <strong>{rupiah(dendaBerjalan)}</strong>.
                </p>
            )}
            </section>
        )}

        <section className={KELAS_KARTU}>
            <div className="flex items-baseline justify-between gap-4 mb-2.5">
            <h2>Notifikasi</h2>

            {adaNotifBelumDibaca && (
                <form action={tandaiNotifDibaca}>
                <button className="cursor-pointer font-bold text-biru underline">
                    Tandai semua dibaca
                </button>
                </form>
            )}
            </div>

            {notifikasi.map((n) => (
                <div
                    key={n.id}
                    className="grid gap-0.5 border-b-2 border-dashed border-biru-muda py-3.5"
                >
                    <span>
                    {!n.dibaca && <Badge>Baru</Badge>} {n.pesan}
                    </span>
                    <small>{formatTanggal(n.dibuat_pada)}</small>
                </div>
            ))}

            {notifikasi.length === 0 && (
                <p className="p-5 text-center opacity-70">Belum ada notifikasi.</p>
            )}
        </section>

        <section>
            <h2 className="mb-4">Pinjaman Aktif</h2>

            <div className="overflow-x-auto">
                <table className={KELAS_TABEL}>
                    <thead>
                    <tr>
                        <th>Buku</th>
                        <th>Status</th>
                        <th>Jatuh tempo</th>
                        <th>Denda berjalan</th>
                        <th>Aksi</th>
                    </tr>
                    </thead>

                    <tbody>
                        {aktif.map((p) => (
                            <tr key={p.id}>
                                <td>{p.judul}</td>
                                    <td>
                                        <Badge>{p.status}</Badge>
                                    </td>
                                    <td>{formatTanggal(p.jatuh_tempo)}</td>
                                    <td>
                                        {p.denda_saat_ini > 0 ? rupiah(p.denda_saat_ini) : "-"}
                                    </td>
                                    <td>
                                        {p.status === "Sedang Dipinjam" &&
                                        p.status_perpanjangan === "Tidak Ada" && (
                                            <form action={ajukanPerpanjangan}>
                                            <input type="hidden" name="id" value={p.id} />
                                            <button className={KELAS_TOMBOL_AKSI}>
                                                Ajukan Perpanjangan
                                            </button>
                                            </form>
                                        )}

                                    {p.status_perpanjangan !== "Tidak Ada" && (
                                        <span>
                                            Perpanjangan {p.status_perpanjangan.toLowerCase()}
                                        </span>
                                    )}

                                    {p.status === "Menunggu Konfirmasi" && (
                                        <small>Temui petugas sirkulasi</small>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {aktif.length === 0 && (
                            <tr>
                            <td colSpan={5} className="p-5 text-center opacity-70">
                                Belum ada pinjaman aktif.{" "}
                                <Link
                                href="/katalog"
                                className="font-bold text-biru underline"
                                >
                                Cari buku
                                </Link>
                            </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>

        {sedangDiulas && (
            <section className={KELAS_KARTU} id="ulasan">
                <h2 className="mb-4">Ulasan: {sedangDiulas.judul}</h2>

                <form action={beriUlasan} className="grid gap-4 md:grid-cols-2">
                    <input
                    type="hidden"
                    name="peminjaman_id"
                    value={sedangDiulas.id}
                    />

                    <Field
                    label="Rating"
                    nama="rating"
                    tipe="select"
                    nilai={sedangDiulas.rating_saya ?? 5}
                    >
                    {OPSI_RATING.map((n) => (
                        <option key={n} value={n}>
                        {"★".repeat(n)} ({n})
                        </option>
                    ))}
                    </Field>

                    <Field
                    label="Komentar"
                    nama="komentar"
                    tipe="textarea"
                    nilai={sedangDiulas.komentar_saya}
                    />

                    <button className={`${KELAS_TOMBOL_SUBMIT} col-span-full`}>
                        Simpan ulasan
                    </button>
                </form>
            </section>
        )}

            <section>
                <h2 className="mb-4">Riwayat Transaksi</h2>

                <div className="overflow-x-auto">
                    <table className={KELAS_TABEL}>
                        <thead>
                        <tr>
                            <th>Buku</th>
                            <th>Status</th>
                            <th>Dikembalikan</th>
                            <th>Denda</th>
                            <th>Aksi</th>
                        </tr>
                        </thead>

                        <tbody>
                        {riwayat.map((p) => (
                            <tr key={p.id}>
                            <td>{p.judul}</td>
                            <td>
                                <Badge>{p.status}</Badge>
                                {p.alasan_penolakan && (
                                <small> {p.alasan_penolakan}</small>
                                )}
                            </td>
                            <td>{formatTanggal(p.tanggal_kembali)}</td>
                            <td>
                                {p.denda_total > 0
                                ? `${rupiah(p.denda_total)} (${p.status_denda})`
                                : "-"}
                            </td>
                            <td>
                                {p.status === "Selesai" && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link
                                            href={`/mahasiswa?ulas=${p.id}#ulasan`}
                                            className={KELAS_TOMBOL_AKSI}
                                        >
                                            {p.rating_saya ? "Ubah ulasan" : "Tulis ulasan"}
                                        </Link>

                                        {p.ulasan_id && (
                                            <TombolHapus
                                                aksi={hapusUlasan}
                                                id={p.ulasan_id}
                                                judul="Hapus ulasan?"
                                                pesan={`Hapus ulasan untuk "${p.judul}"?`}
                                                tambahan={{ kembali: "/mahasiswa" }}
                                            />
                                        )}
                                    </div>
                                )}
                            </td>
                            </tr>
                        ))}

                        {riwayat.length === 0 && (
                            <tr>
                            <td colSpan={5} className="p-5 text-center opacity-70">
                                Belum ada riwayat.
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