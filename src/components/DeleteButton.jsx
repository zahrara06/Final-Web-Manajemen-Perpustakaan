"use client";

export default function DeleteButton({
    action,
    id,
    pesan = "Yakin hapus data ini?",
    label = "Hapus"
}) {
    return (
        <form
            action={action}
            onSubmit={(e) => {
                if (!confirm(pesan)) {
                    e.preventDefault();
                }
            }}
        >
            <input type="hidden" name="id" value={id} />

            <button
                type="submit"
                className="text-red-600 hover:underline text-sm"
            >
                {label}
            </button>
        </form>
    );
}
