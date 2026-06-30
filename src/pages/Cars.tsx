import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Removed Tauri invoke import

interface Car {
  id?: number;
  company: string;
  model: string;
  year: number;
  purchase_date: string;
  plate_number: string;
  color: string;
  purchase_cost: number;
  depreciation_method: string;
}

export default function Cars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<Car>({
    company: "",
    model: "",
    year: new Date().getFullYear(),
    purchase_date: "",
    plate_number: "",
    color: "",
    purchase_cost: 0,
    depreciation_method: "سنوات",
  });

  const loadCars = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/cars");
      const data = await response.json();
      setCars(data);
    } catch (error) {
      console.error("Error loading cars:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذه المركبة؟ لا يمكن التراجع عن هذا الإجراء.")) {
      try {
        await fetch(`http://localhost:3001/api/cars/${id}`, { method: "DELETE" });
        loadCars();
      } catch (error) {
        console.error("Error deleting car:", error);
      }
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:3001/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      setShowForm(false);
      loadCars(); // Reload the list
      // Reset form
      setFormData({
        company: "",
        model: "",
        year: new Date().getFullYear(),
        purchase_date: "",
        plate_number: "",
        color: "",
        purchase_cost: 0,
        depreciation_method: "سنوات",
      });
    } catch (error) {
      console.error("Error adding car:", error);
      alert("حدث خطأ أثناء الإضافة: " + error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 mt-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-blue-600">إدارة المركبات</h1>
          <p className="text-gray-500 mt-2">إدارة السيارات، مستنداتها، ونسبة التغطية</p>
        </div>
        <Link to="/" className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 shadow-lg">
          العودة للرئيسية
        </Link>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">إضافة مركبة جديدة</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="الشركة (مثال: تويوتا)" required className="border p-3 rounded-lg" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
              <input type="text" placeholder="الموديل (مثال: كامري)" required className="border p-3 rounded-lg" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} />
              <input type="number" placeholder="سنة الصنع" required className="border p-3 rounded-lg" value={formData.year} onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})} />
              <input type="date" placeholder="تاريخ الشراء" required className="border p-3 rounded-lg" value={formData.purchase_date} onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} />
              <input type="text" placeholder="لوحة السيارة" required className="border p-3 rounded-lg" value={formData.plate_number} onChange={(e) => setFormData({...formData, plate_number: e.target.value})} />
              <input type="text" placeholder="لون السيارة" required className="border p-3 rounded-lg" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} />
              <input type="number" placeholder="تكلفة الشراء (ريال)" required className="border p-3 rounded-lg" value={formData.purchase_cost} onChange={(e) => setFormData({...formData, purchase_cost: parseFloat(e.target.value)})} />
              <select className="border p-3 rounded-lg" value={formData.depreciation_method} onChange={(e) => setFormData({...formData, depreciation_method: e.target.value})}>
                <option value="سنوات">سنوات</option>
                <option value="كيلومترات">كيلومترات</option>
              </select>
            </div>
            <div className="flex gap-4 mt-6">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">حفظ</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">قائمة المركبات</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">إضافة مركبة جديدة</button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4 rounded-tr-lg">اللوحة</th>
                <th className="p-4">النوع والموديل</th>
                <th className="p-4">سنة الصنع</th>
                <th className="p-4">تكلفة الشراء</th>
                <th className="p-4">طريقة الإهلاك</th>
                <th className="p-4 rounded-tl-lg">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {cars.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-4 text-gray-500">لا توجد مركبات مسجلة بعد</td></tr>
              ) : (
                cars.map(car => (
                  <tr key={car.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 font-bold">{car.plate_number}</td>
                    <td className="p-4">{car.company} {car.model}</td>
                    <td className="p-4">{car.year}</td>
                    <td className="p-4">{car.purchase_cost.toLocaleString()} ريال</td>
                    <td className="p-4">{car.depreciation_method}</td>
                    <td className="p-4">
                      <Link to={`/cars/${car.id}`} className="text-blue-600 hover:underline mx-2">تفاصيل</Link>
                      <button onClick={() => car.id && handleDelete(car.id)} className="text-red-500 hover:underline mx-2">حذف</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
