import "server-only";
import pg from "pg";

const { Pool, types } = pg;

types.setTypeParser(20, Number);
types.setTypeParser(1700, Number);
types.setTypeParser(1082, (nilai) => nilai);
types.setTypeParser(1114, (nilai) => nilai);

let pool = globalThis.kolamKoneksi;

if (!pool) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    pool.on("error", (error) => {
        console.error("Unexpected database error:", error);
    });

    globalThis.kolamKoneksi = pool;
}

export default pool;

export async function transaksi(fungsiTransaksi) {
    const koneksi = await pool.connect();

    try {
        await koneksi.query("BEGIN");

        const hasilTransaksi = await fungsiTransaksi(koneksi);

        await koneksi.query("COMMIT");

        return hasilTransaksi;
    } catch (error) {
        await koneksi.query("ROLLBACK");
        throw error;
    } finally {
        koneksi.release();
    }
}
