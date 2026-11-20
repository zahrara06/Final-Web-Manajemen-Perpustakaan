export async function notif(db, userId, pesan) {
  await db.query("INSERT INTO notifications (user_id, pesan) VALUES ($1, $2)", [userId, pesan]);
}