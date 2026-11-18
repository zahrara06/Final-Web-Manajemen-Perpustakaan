export default function Pesan({ searchParams }) {
    if (searchParams?.error) {
        return (
            <p className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {searchParams.error}
            </p>
        );
    }

    if (searchParams?.ok) {
        return (
            <p className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                {searchParams.ok}
            </p>
        );
    }

    return null;
}