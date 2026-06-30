mod db;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Car {
    pub id: Option<i32>,
    pub company: String,
    pub model: String,
    pub year: i32,
    pub purchase_date: String,
    pub plate_number: String,
    pub color: String,
    pub purchase_cost: f64,
    pub depreciation_method: String,
}

#[tauri::command]
fn get_cars() -> Result<Vec<Car>, String> {
    let path = db::get_db_path();
    let conn = rusqlite::Connection::open(&path).map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare("SELECT id, company, model, year, purchase_date, plate_number, color, purchase_cost, depreciation_method FROM cars").map_err(|e| e.to_string())?;
    let cars_iter = stmt.query_map([], |row| {
        Ok(Car {
            id: row.get(0)?,
            company: row.get(1)?,
            model: row.get(2)?,
            year: row.get(3)?,
            purchase_date: row.get(4)?,
            plate_number: row.get(5)?,
            color: row.get(6)?,
            purchase_cost: row.get(7)?,
            depreciation_method: row.get(8)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut cars = Vec::new();
    for car in cars_iter {
        cars.push(car.map_err(|e| e.to_string())?);
    }
    Ok(cars)
}

#[tauri::command]
fn add_car(car: Car) -> Result<String, String> {
    let path = db::get_db_path();
    let conn = rusqlite::Connection::open(&path).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT INTO cars (company, model, year, purchase_date, plate_number, color, purchase_cost, depreciation_method) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![car.company, car.model, car.year, car.purchase_date, car.plate_number, car.color, car.purchase_cost, car.depreciation_method],
    ).map_err(|e| e.to_string())?;
    Ok("Car added successfully".into())
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Driver {
    pub id: Option<i32>,
    pub name: String,
    pub phone: String,
    pub national_id: String,
    pub hire_date: String,
}

#[tauri::command]
fn get_drivers() -> Result<Vec<Driver>, String> {
    let path = db::get_db_path();
    let conn = rusqlite::Connection::open(&path).map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare("SELECT id, name, phone, national_id, hire_date FROM drivers").map_err(|e| e.to_string())?;
    let iter = stmt.query_map([], |row| {
        Ok(Driver {
            id: row.get(0)?,
            name: row.get(1)?,
            phone: row.get(2)?,
            national_id: row.get(3)?,
            hire_date: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut list = Vec::new();
    for item in iter {
        list.push(item.map_err(|e| e.to_string())?);
    }
    Ok(list)
}

#[tauri::command]
fn add_driver(driver: Driver) -> Result<String, String> {
    let path = db::get_db_path();
    let conn = rusqlite::Connection::open(&path).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT INTO drivers (name, phone, national_id, hire_date) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![driver.name, driver.phone, driver.national_id, driver.hire_date],
    ).map_err(|e| e.to_string())?;
    Ok("Driver added successfully".into())
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Maintenance {
    pub id: Option<i32>,
    pub car_id: i32,
    pub kilometers: i32,
    pub oil_change: bool,
    pub filter_change: bool,
    pub cost: f64,
    pub amount_from_driver: f64,
    pub deducted_from_weekly: f64,
}

#[tauri::command]
fn add_maintenance(record: Maintenance) -> Result<String, String> {
    let path = db::get_db_path();
    let conn = rusqlite::Connection::open(&path).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT INTO maintenance (car_id, kilometers, oil_change, filter_change, cost, amount_from_driver, deducted_from_weekly) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![record.car_id, record.kilometers, record.oil_change, record.filter_change, record.cost, record.amount_from_driver, record.deducted_from_weekly],
    ).map_err(|e| e.to_string())?;
    Ok("Maintenance added successfully".into())
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Contract {
    pub id: Option<i32>,
    pub driver_id: i32,
    pub car_id: i32,
    pub start_date: String,
    pub weekly_required: f64,
    pub total_required: f64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Violation {
    pub id: Option<i32>,
    pub contract_id: i32,
    pub amount: f64,
    pub violation_date: String,
    pub reason: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Voucher {
    pub id: Option<i32>,
    pub voucher_number: String,
    pub voucher_type: String,
    pub auto_generated: bool,
    pub voucher_date: String,
    pub amount: f64,
    pub related_driver_id: Option<i32>,
    pub related_car_id: Option<i32>,
    pub description: String,
}

#[tauri::command]
fn get_vouchers() -> Result<Vec<Voucher>, String> {
    let path = db::get_db_path();
    let conn = rusqlite::Connection::open(&path).map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare("SELECT id, voucher_number, voucher_type, auto_generated, voucher_date, amount, related_driver_id, related_car_id, description FROM vouchers ORDER BY id DESC").map_err(|e| e.to_string())?;
    let iter = stmt.query_map([], |row| {
        Ok(Voucher {
            id: row.get(0)?,
            voucher_number: row.get(1)?,
            voucher_type: row.get(2)?,
            auto_generated: row.get(3)?,
            voucher_date: row.get(4)?,
            amount: row.get(5)?,
            related_driver_id: row.get(6)?,
            related_car_id: row.get(7)?,
            description: row.get(8)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut list = Vec::new();
    for item in iter {
        list.push(item.map_err(|e| e.to_string())?);
    }
    Ok(list)
}

#[tauri::command]
fn add_violation(violation: Violation) -> Result<String, String> {
    let path = db::get_db_path();
    let conn = rusqlite::Connection::open(&path).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT INTO violations (contract_id, amount, violation_date, reason) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![violation.contract_id, violation.amount, violation.violation_date, violation.reason],
    ).map_err(|e| e.to_string())?;
    Ok("Violation added successfully".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|_app| {
            db::init_db().expect("Failed to initialize database");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_cars, add_car, get_drivers, add_driver, add_maintenance, get_vouchers, add_violation])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
