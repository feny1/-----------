import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Removed Tauri invoke import

interface Driver {
  id?: number;
  name: string;
  phone: string;
  national_id: string;
  hire_date: string;
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<Driver>({
    name: "",
    phone: "",
    national_id: "",
    hire_date: new Date().toISOString().split("T")[0],
  });

  const loadDrivers = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/drivers");
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error("Error loading drivers:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا السائق؟")) {
      try {
        await fetch(`http://localhost:3001/api/drivers/${id}`, { method: "DELETE" });
        loadDrivers();
      } catch (error) {
        console.error("Error deleting driver:", error);
      }
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:3001/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      setShowForm(false);
      loadDrivers();
      setFormData({
        name: "",
        phone: "",
        national_id: "",
        hire_date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error adding driver:", error);
      alert("حدث خطأ أثناء الإضافة: " + error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 mt-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-green-500">إدارة السائقين</h1>
          <p className="text-gray-500 mt-2">إدارة السائقين، عقودهم، وسلفياتهم وكشوف الحساب</p>
        </div>
        <Link to="/" className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 shadow-lg">
          العودة للرئيسية
        </Link>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">إضافة سائق جديد</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="الاسم الرباعي" required className="border p-3 rounded-lg" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input type="text" placeholder="رقم الجوال (05xxxxxx)" required className="border p-3 rounded-lg" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <input type="text" placeholder="رقم الهوية / الإقامة" required className="border p-3 rounded-lg" value={formData.national_id} onChange={(e) => setFormData({...formData, national_id: e.target.value})} />
              <input type="date" placeholder="تاريخ التعيين" required className="border p-3 rounded-lg" value={formData.hire_date} onChange={(e) => setFormData({...formData, hire_date: e.target.value})} />
            </div>
            <div className="flex gap-4 mt-6">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">حفظ السائق</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">قائمة السائقين</h2>
          <div className="flex gap-4">
            <Link to="/contracts" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">توقيع عقد تسليم</Link>
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">إضافة سائق جديد</button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4 rounded-tr-lg">الاسم</th>
                <th className="p-4">رقم الجوال</th>
                <th className="p-4">رقم الهوية</th>
                <th className="p-4">تاريخ التعيين</th>
                <th className="p-4 rounded-tl-lg">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-4 text-gray-500">لا يوجد سائقين مسجلين بعد</td></tr>
              ) : (
                drivers.map(driver => (
                  <tr key={driver.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 font-bold">{driver.name}</td>
                    <td className="p-4">{driver.phone}</td>
                    <td className="p-4">{driver.national_id}</td>
                    <td className="p-4">{driver.hire_date}</td>
                    <td className="p-4">
                      <Link to={`/drivers/${driver.id}`} className="text-green-600 hover:underline mx-2">كشف السائق</Link>
                      <button onClick={() => driver.id && handleDelete(driver.id)} className="text-red-500 hover:underline mx-2">حذف</button>
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
