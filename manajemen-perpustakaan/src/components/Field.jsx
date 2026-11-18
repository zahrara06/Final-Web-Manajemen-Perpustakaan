export default function Field({ label, ...props }) {
    return (
        <label className="block text-sm">
            <span className="text-slate-600">{label}</span>
            <input required {...props} className="inp mt-1" />
        </label>
    );
}