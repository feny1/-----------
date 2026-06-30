use rusqlite::{Connection, Result};
use std::path::PathBuf;

pub fn get_db_path() -> PathBuf {
    let mut path = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    path.push("database.sqlite");
    path
}

pub fn init_db() -> Result<()> {
    let path = get_db_path();
    let conn = Connection::open(&path)?;

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            model TEXT NOT NULL,
            year INTEGER NOT NULL,
            purchase_date TEXT NOT NULL,
            plate_number TEXT NOT NULL,
            color TEXT NOT NULL,
            purchase_cost REAL NOT NULL,
            depreciation_method TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS car_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            car_id INTEGER NOT NULL,
            document_name TEXT NOT NULL,
            cost REAL NOT NULL,
            expiry_date TEXT NOT NULL,
            FOREIGN KEY(car_id) REFERENCES cars(id)
        );
        CREATE TABLE IF NOT EXISTS drivers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            national_id TEXT NOT NULL,
            hire_date TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS contracts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            driver_id INTEGER NOT NULL,
            car_id INTEGER NOT NULL,
            start_date TEXT NOT NULL,
            weekly_required REAL NOT NULL,
            total_required REAL NOT NULL,
            FOREIGN KEY(driver_id) REFERENCES drivers(id),
            FOREIGN KEY(car_id) REFERENCES cars(id)
        );
        CREATE TABLE IF NOT EXISTS violations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contract_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            violation_date TEXT NOT NULL,
            reason TEXT NOT NULL,
            FOREIGN KEY(contract_id) REFERENCES contracts(id)
        );
        CREATE TABLE IF NOT EXISTS maintenance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            car_id INTEGER NOT NULL,
            kilometers INTEGER NOT NULL,
            oil_change BOOLEAN NOT NULL,
            filter_change BOOLEAN NOT NULL,
            cost REAL NOT NULL,
            amount_from_driver REAL NOT NULL DEFAULT 0,
            deducted_from_weekly REAL NOT NULL DEFAULT 0,
            FOREIGN KEY(car_id) REFERENCES cars(id)
        );
        CREATE TABLE IF NOT EXISTS advances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            driver_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            advance_date TEXT NOT NULL,
            FOREIGN KEY(driver_id) REFERENCES drivers(id)
        );
        CREATE TABLE IF NOT EXISTS vouchers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            voucher_number TEXT NOT NULL,
            voucher_type TEXT NOT NULL,
            auto_generated BOOLEAN NOT NULL,
            voucher_date TEXT NOT NULL,
            amount REAL NOT NULL,
            related_driver_id INTEGER,
            related_car_id INTEGER,
            description TEXT NOT NULL,
            FOREIGN KEY(related_driver_id) REFERENCES drivers(id),
            FOREIGN KEY(related_car_id) REFERENCES cars(id)
        );
        "
    )?;

    Ok(())
}
