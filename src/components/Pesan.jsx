export default function Pesan({ sp }) {
  if (!sp?.pesan) return null;

  const warna =
    sp.jenis === "error"
      ? "border-red-700 bg-red-100 text-red-900"
      : "border-biru-tua bg-kuning-muda";

  return (
    <p className={`rounded-xl border-2 px-4 py-3 font-semibold ${warna}`}>
      {sp.pesan}
    </p>
  );
}