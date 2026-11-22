export default function Badge({ children, warna = "" }) {
    const warnaLatar = warna === "biru" ? "bg-biru text-white" : "bg-kuning text-biru-tua";
    return (
        <span className={`inline-block rounded-full border-2 border-biru-tua px-3 py-0.5 text-xs font-bold ${warnaLatar}`}>
        {children}
        </span>
    );
}
