import "server-only";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (error) => {
  console.error("Unexpected database error:", error);
});

export async function transaksi(fungsiTransaksi) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const hasilTransaksi = await fungsiTransaksi(client);

    await client.query("COMMIT");
    return hasilTransaksi;

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;

  } finally {
    client.release();
  }
}

export default pool;