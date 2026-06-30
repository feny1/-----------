import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
// Removed Tauri invoke import

interface Car {
  id: number;
  plate_number: string;
  company: string;
  model: string;
}

export default function Maintenance() {
  const [cars, setCars] = useState<Car[]>([]);
  const [amountFromDriver, setAmountFromDriver] = useState("");
  const [deductedFromWeekly, setDeductedFromWeekly] = useState("");
  
  const [formData, setFormData] = useState({
    car_id: 0,
    kilometers: "",
    oil_change: false,
    filter_change: false,
    cost: "",
  });

  useEffect(() => {
    const loadCars = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/cars");
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error("Error loading cars:", error);
      }
    };
    loadCars();
  }, []);

  const handleAmountFromDriverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmountFromDriver(val);
    if (val !== "") {
      setDeductedFromWeekly(""); // Mutual exclusion
    }
  };

  const handleDeductedFromWeeklyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDeductedFromWeekly(val);
    if (val !== "") {
      setAmountFromDriver(""); // Mutual exclusion
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.car_id === 0) {
      alert("الرجاء اختيار المركبة");
      return;
    }
    try {
      await fetch("http://localhost:3001/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car_id: formData.car_id,
          kilometers: parseInt(formData.kilometers) || 0,
          oil_change: formData.oil_change,
          filter_change: formData.filter_change,
          cost: parseFloat(formData.cost) || 0,
          amount_from_driver: parseFloat(amountFromDriver) || 0,
          deducted_from_weekly: parseFloat(deductedFromWeekly) || 0,
        })
      });
      alert("تم إضافة الصيانة بنجاح");
      setFormData({
        car_id: 0,
        kilometers: "",
        oil_change: false,
        filter_change: false,
        cost: "",
      });
      setAmountFromDriver("");
      setDeductedFromWeekly("");
    } catch (error) {
      console.error("Error adding maintenance:", error);
      alert("حدث خطأ أثناء الإضافة: " + error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 mt-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-red-500">قائمة صيانات</h1>
          <p className="text-gray-500 mt-2">إدخال وإدارة الصيانات بوقودها المشروطة</p>
        </div>
        <Link to="/" className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 shadow-lg">
          العودة للرئيسية
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">إضافة صيانة جديدة</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">المركبة</label>
              <select 
                className="w-full border border-gray-300 p-3 rounded-lg bg-white"
                value={formData.car_id}
                onChange={(e) => setFormData({...formData, car_id: parseInt(e.target.value)})}
                required
              >
                <option value={0}>اختر المركبة</option>
                {cars.map(car => (
                  <option key={car.id} value={car.id}>{car.plate_number} - {car.company} {car.model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">عدد الكيلومترات</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 p-3 rounded-lg" 
                placeholder="مثال: 50000" 
                value={formData.kilometers}
                onChange={(e) => setFormData({...formData, kilometers: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex gap-6 items-center">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-red-500" 
                checked={formData.oil_change}
                onChange={(e) => setFormData({...formData, oil_change: e.target.checked})}
              />
              <span>تغيير زيت</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-red-500" 
                checked={formData.filter_change}
                onChange={(e) => setFormData({...formData, filter_change: e.target.checked})}
              />
              <span>تغيير فلتر</span>
            </label>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">التكلفة الإجمالية للصيانة</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 p-3 rounded-lg" 
              placeholder="المبلغ" 
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: e.target.value})}
              required
            />
          </div>

          <div className="p-6 bg-red-50 rounded-xl border border-red-100 space-y-4">
            <h3 className="font-bold text-red-600">الشروط المالية (خيار واحد فقط)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">المبلغ المطلوب من السائق دفعه</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 p-3 rounded-lg disabled:bg-gray-100 disabled:opacity-50" 
                  placeholder="يضاف للإجمالي الأسبوعي"
                  value={amountFromDriver}
                  onChange={handleAmountFromDriverChange}
                  disabled={deductedFromWeekly !== ""}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">المبلغ المحسوم من السائق</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 p-3 rounded-lg disabled:bg-gray-100 disabled:opacity-50" 
                  placeholder="يخصم من المطلوب الأسبوعي"
                  value={deductedFromWeekly}
                  onChange={handleDeductedFromWeeklyChange}
                  disabled={amountFromDriver !== ""}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="bg-red-500 text-white px-8 py-3 rounded-xl hover:bg-red-600 font-bold w-full md:w-auto">
            حفظ الصيانة
          </button>
        </form>
      </div>
    </div>
  );
}
