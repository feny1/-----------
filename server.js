import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database('database.sqlite');

// Initialize DB
db.exec(`
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
      payment_method TEXT DEFAULT 'كاش'
  );
  CREATE TABLE IF NOT EXISTS car_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id INTEGER NOT NULL,
      document_type TEXT NOT NULL,
      document_number TEXT,
      expiry_date TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY(car_id) REFERENCES cars(id)
  );
`);

// API Endpoints
app.get('/api/cars', (req, res) => {
  const cars = db.prepare('SELECT * FROM cars').all();
  res.json(cars);
});

app.post('/api/cars', (req, res) => {
  const c = req.body;
  const stmt = db.prepare('INSERT INTO cars (company, model, year, purchase_date, plate_number, color, purchase_cost, depreciation_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(c.company, c.model, c.year, c.purchase_date, c.plate_number, c.color, c.purchase_cost, c.depreciation_method);
  res.json({ message: 'Car added successfully' });
});

app.get('/api/drivers', (req, res) => {
  const drivers = db.prepare('SELECT * FROM drivers').all();
  res.json(drivers);
});

app.post('/api/drivers', (req, res) => {
  const d = req.body;
  const stmt = db.prepare('INSERT INTO drivers (name, phone, national_id, hire_date) VALUES (?, ?, ?, ?)');
  stmt.run(d.name, d.phone, d.national_id, d.hire_date);
  res.json({ message: 'Driver added successfully' });
});

app.post('/api/maintenance', (req, res) => {
  const m = req.body;
  const stmt = db.prepare('INSERT INTO maintenance (car_id, kilometers, oil_change, filter_change, cost, amount_from_driver, deducted_from_weekly) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(m.car_id, m.kilometers, m.oil_change ? 1 : 0, m.filter_change ? 1 : 0, m.cost, m.amount_from_driver, m.deducted_from_weekly);
  res.json({ message: 'Maintenance added successfully' });
});

app.post('/api/car_documents', (req, res) => {
  try {
    const { car_id, document_type, document_number, expiry_date, notes } = req.body;
    const stmt = db.prepare('INSERT INTO car_documents (car_id, document_type, document_number, expiry_date, notes) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(car_id, document_type, document_number, expiry_date, notes);
    res.json({ id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/vouchers', (req, res) => {
  const vouchers = db.prepare('SELECT * FROM vouchers ORDER BY id DESC').all();
  res.json(vouchers);
});

app.get('/api/vouchers/:id', (req, res) => {
  const voucher = db.prepare(`
    SELECT vouchers.*,
      drivers.name as driver_name, drivers.national_id as driver_national_id, drivers.phone as driver_phone,
      cars.plate_number, cars.company as car_company, cars.model as car_model, cars.year as car_year, cars.color as car_color
    FROM vouchers 
    LEFT JOIN drivers ON vouchers.related_driver_id = drivers.id 
    LEFT JOIN cars ON vouchers.related_car_id = cars.id 
    WHERE vouchers.id = ?
  `).get(req.params.id);
  if (!voucher) return res.status(404).json({error: 'Voucher not found'});

  // If handover voucher, also fetch the contract
  if (voucher.voucher_type === 'سند تسليم مركبة' && voucher.related_driver_id && voucher.related_car_id) {
    const contract = db.prepare(
      'SELECT * FROM contracts WHERE driver_id = ? AND car_id = ? ORDER BY id DESC LIMIT 1'
    ).get(voucher.related_driver_id, voucher.related_car_id);
    if (contract) voucher.contract = contract;
  }

  res.json(voucher);
});

app.post('/api/vouchers', (req, res) => {
  try {
    const v = req.body;
    const stmt = db.prepare('INSERT INTO vouchers (voucher_number, voucher_type, auto_generated, voucher_date, amount, related_driver_id, related_car_id, description, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const vNumber = "V-" + Date.now();
    const info = stmt.run(vNumber, v.voucher_type, 0, v.voucher_date, v.amount, v.related_driver_id || null, v.related_car_id || null, v.description, v.payment_method || 'كاش');
    res.json({ id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/contracts', (req, res) => {
  const contracts = db.prepare('SELECT contracts.*, drivers.name as driver_name, cars.plate_number FROM contracts JOIN drivers ON contracts.driver_id = drivers.id JOIN cars ON contracts.car_id = cars.id').all();
  res.json(contracts);
});

app.post('/api/contracts', (req, res) => {
  const c = req.body;
  
  const insertContract = db.transaction((contract) => {
    // 1. Insert Contract
    const stmt = db.prepare('INSERT INTO contracts (driver_id, car_id, start_date, weekly_required, total_required) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(contract.driver_id, contract.car_id, contract.start_date, contract.weekly_required, contract.total_required);
    
    // 2. Auto-generate Handover Voucher
    const voucherStmt = db.prepare('INSERT INTO vouchers (voucher_number, voucher_type, auto_generated, voucher_date, amount, related_driver_id, related_car_id, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const vNumber = "V-" + Date.now();
    voucherStmt.run(vNumber, "سند تسليم مركبة", 1, contract.start_date, 0, contract.driver_id, contract.car_id, "سند تسليم مركبة تلقائي لتوقيع العقد");
    
    return info.lastInsertRowid;
  });
  
  insertContract(c);
  res.json({ message: 'Contract created and voucher auto-generated' });
});

app.get('/api/violations', (req, res) => {
  const violations = db.prepare('SELECT * FROM violations ORDER BY id DESC').all();
  res.json(violations);
});

app.post('/api/violations', (req, res) => {
  const v = req.body;
  const stmt = db.prepare('INSERT INTO violations (contract_id, amount, violation_date, reason) VALUES (?, ?, ?, ?)');
  stmt.run(v.contract_id, v.amount, v.violation_date, v.reason);
  res.json({ message: 'Violation added successfully' });
});

app.get('/api/summary', (req, res) => {
  const cars = db.prepare('SELECT count(*) as count FROM cars').get();
  const drivers = db.prepare('SELECT count(*) as count FROM drivers').get();
  res.json({
    total_cars: cars.count,
    active_cars: 0,
    total_expected_income: 0,
    total_actual_income: 0,
    document_alerts: []
  });
});

app.get('/api/cars/:id', (req, res) => {
  const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  if (!car) return res.status(404).json({error: 'Car not found'});
  
  const maintenance = db.prepare('SELECT * FROM maintenance WHERE car_id = ? ORDER BY id DESC').all(car.id);
  const documents = db.prepare('SELECT * FROM car_documents WHERE car_id = ? ORDER BY expiry_date ASC').all(car.id);
  
  // Fetch current contract to get current driver.
  const currentContract = db.prepare('SELECT contracts.*, drivers.name FROM contracts JOIN drivers ON contracts.driver_id = drivers.id WHERE car_id = ? ORDER BY contracts.id DESC LIMIT 1').get(car.id);
  
  if (currentContract) {
    car.current_driver = {
      name: currentContract.name,
      start_date: currentContract.start_date
    };
  }

  res.json({ ...car, maintenance, documents, timeline: [] });
});

app.get('/api/drivers/:id', (req, res) => {
  const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id);
  if (!driver) return res.status(404).json({error: 'Driver not found'});
  
  const contracts = db.prepare('SELECT * FROM contracts WHERE driver_id = ?').all(driver.id);
  let current_week_required = 0;
  let statements = [];
  
  if (contracts.length > 0) {
    const currentContract = contracts[contracts.length - 1];
    
    // 1. Contract Weekly Requirement
    statements.push({
      id: currentContract.id,
      date: currentContract.start_date,
      description: "قيمة العقد الأسبوعية",
      debit: currentContract.weekly_required,
      credit: 0,
      category: 'contract'
    });
    current_week_required += currentContract.weekly_required;
    
    // 2. Violations
    const violations = db.prepare('SELECT * FROM violations WHERE contract_id = ?').all(currentContract.id);
    violations.forEach(v => {
      statements.push({
        id: v.id,
        date: v.violation_date,
        description: "مخالفة: " + v.reason,
        debit: v.amount,
        credit: 0,
        category: 'violation'
      });
      current_week_required += v.amount;
    });
    
    // 3. Maintenance
    const maintenance = db.prepare('SELECT * FROM maintenance WHERE car_id = ?').all(currentContract.car_id);
    maintenance.forEach(m => {
      if (m.amount_from_driver > 0) {
        statements.push({ id: m.id, date: currentContract.start_date, description: "تحمل تكلفة صيانة", debit: m.amount_from_driver, credit: 0, category: 'maintenance' });
        current_week_required += m.amount_from_driver;
      }
      if (m.deducted_from_weekly > 0) {
        statements.push({ id: m.id, date: currentContract.start_date, description: "خصم تعويض صيانة من المطلوب", debit: 0, credit: m.deducted_from_weekly, category: 'maintenance' });
        current_week_required -= m.deducted_from_weekly;
      }
    });
    
    // 4. Vouchers
    const vouchers = db.prepare('SELECT * FROM vouchers WHERE related_driver_id = ?').all(driver.id);
    vouchers.forEach(v => {
      if (v.voucher_type === "سند قبض") {
        statements.push({ id: v.id, date: v.voucher_date, description: v.description, debit: 0, credit: v.amount, category: v.payment_method === 'شبكة' ? 'network' : 'cash' });
        current_week_required -= v.amount;
      } else if (v.voucher_type === "سلفة") {
        statements.push({ id: v.id, date: v.voucher_date, description: v.description, debit: v.amount, credit: 0, category: 'advance' });
        current_week_required += v.amount;
      } else {
        // Other voucher types (like handover vouchers which have 0 amount)
        if (v.amount > 0) {
          statements.push({ id: v.id, date: v.voucher_date, description: v.description, debit: v.amount, credit: 0, category: 'advance' });
          current_week_required += v.amount;
        }
      }
    });
    
    // Sort statements by date, then by ID
    statements.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.id - b.id;
    });
    
    // Calculate running balance
    let runningBalance = 0;
    statements = statements.map(s => {
      runningBalance += (s.debit - s.credit);
      return { ...s, balance: runningBalance };
    });
    
    // Reverse to show newest at top
    statements.reverse();
  }
  
  res.json({ ...driver, contracts, statements, current_week_required });
});

app.listen(3001, () => {
  console.log('API Server running on port 3001');
});

// DELETE Endpoints
['cars', 'drivers', 'contracts', 'violations', 'maintenance', 'vouchers', 'car_documents'].forEach(table => {
  app.delete(`/api/${table}/:id`, (req, res) => {
    try {
      const stmt = db.prepare(`DELETE FROM ${table} WHERE id = ?`);
      const info = stmt.run(req.params.id);
      if (info.changes > 0) {
        res.json({ message: 'Deleted successfully' });
      } else {
        res.status(404).json({ error: 'Record not found' });
      }
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
});

app.delete('/api/clear-all', (req, res) => {
  try {
    const tables = ['cars', 'drivers', 'contracts', 'violations', 'maintenance', 'vouchers', 'car_documents'];
    const deleteTransaction = db.transaction(() => {
      tables.forEach(table => {
        db.prepare(`DELETE FROM ${table}`).run();
        // Optional: Reset autoincrement counter
        db.prepare(`DELETE FROM sqlite_sequence WHERE name='${table}'`).run();
      });
    });
    deleteTransaction();
    res.json({ message: 'All data cleared successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
