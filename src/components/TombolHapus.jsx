"use client";

export default function TombolHapus({ aksi, id, pesan = "Yakin ingin menghapus data ini?" }) {
  return (
        <form
            action={aksi}
            onSubmit={(e) => {
                if (!confirm(pesan)) e.preventDefault();
            }}
        >
            <input type="hidden" name="id" value={id} />
            <button type="submit" className="cursor-pointer font-bold text-red-700 underline">Hapus</button>
        </form>
    );
}
