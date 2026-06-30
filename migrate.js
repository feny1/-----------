import Database from 'better-sqlite3';
const db = new Database('database.sqlite');
try {
  db.exec("ALTER TABLE vouchers ADD COLUMN payment_method TEXT DEFAULT 'كاش'");
  console.log("Added payment_method column to vouchers table.");
} catch (e) {
  console.log("Column might already exist: ", e.message);
}
