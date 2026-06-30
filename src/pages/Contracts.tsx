import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Contracts() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    driver_id: "",
    car_id: "",
    start_date: new Date().toISOString().split("T")[0],
    weekly_required: "",
    total_required: "",
  });

  const loadData = () => {
    fetch("http://localhost:3001/api/drivers").then(res => res.json()).then(setDrivers);
    fetch("http://localhost:3001/api/cars").then(res => res.json()).then(setCars);
    fetch("http://localhost:3001/api/contracts").then(res => res.json()).then(setContracts);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا العقد؟")) {
      try {
        await fetch(`http://localhost:3001/api/contracts/${id}`, { method: "DELETE" });
        loadData();
      } catch (error) {
        console.error("Error deleting contract:", error);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.driver_id || !formData.car_id) {
      alert("يرجى اختيار السائق والمركبة");
      return;
    }
    
    try {
      await fetch("http://localhost:3001/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver_id: parseInt(formData.driver_id),
          car_id: parseInt(formData.car_id),
          start_date: formData.start_date,
          weekly_required: parseFloat(formData.weekly_required),
          total_required: parseFloat(formData.total_required),
        })
      });
      alert("تم توقيع العقد وإنشاء سند تسليم المركبة التلقائي بنجاح!");
      setShowForm(false);
      loadData();
      setFormData({
        driver_id: "",
        car_id: "",
        start_date: new Date().toISOString().split("T")[0],
        weekly_required: "",
        total_required: "",
      });
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حفظ العقد");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 mt-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-indigo-600">عقود تسليم السيارات</h1>
          <p className="text-gray-500 mt-2">تعيين السائقين على المركبات وتوليد سندات التسليم</p>
        </div>
        <Link to="/drivers" className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 shadow-lg">
          العودة
        </Link>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">إنشاء عقد جديد (تسليم مركبة)</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">اختر السائق</label>
                <select className="w-full border p-3 rounded-lg bg-white" value={formData.driver_id} onChange={(e) => setFormData({...formData, driver_id: e.target.value})} required>
                  <option value="">-- اختر السائق --</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.national_id})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">اختر المركبة</label>
                <select className="w-full border p-3 rounded-lg bg-white" value={formData.car_id} onChange={(e) => setFormData({...formData, car_id: e.target.value})} required>
                  <option value="">-- اختر المركبة --</option>
                  {cars.map(c => <option key={c.id} value={c.id}>{c.plate_number} - {c.company} {c.model}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">تاريخ الاستلام / العقد</label>
                <input type="date" required className="w-full border p-3 rounded-lg" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">المطلوب أسبوعياً (ريال)</label>
                <input type="number" required className="w-full border p-3 rounded-lg" placeholder="مثال: 1500" value={formData.weekly_required} onChange={(e) => setFormData({...formData, weekly_required: e.target.value})} />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">المطلوب إجمالياً (ريال)</label>
                <input type="number" required className="w-full border p-3 rounded-lg" placeholder="إجمالي قيمة العقد" value={formData.total_required} onChange={(e) => setFormData({...formData, total_required: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">اعتماد العقد وإنشاء السند</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">العقود الحالية</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">إنشاء عقد جديد</button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4 rounded-tr-lg">السائق</th>
                <th className="p-4">المركبة (اللوحة)</th>
                <th className="p-4">تاريخ الاستلام</th>
                <th className="p-4">المطلوب أسبوعياً</th>
                <th className="p-4">الإجمالي</th>
                <th className="p-4 rounded-tl-lg">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-4 text-gray-500">لا توجد عقود مسجلة بعد</td></tr>
              ) : (
                contracts.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 font-bold">{c.driver_name}</td>
                    <td className="p-4 text-blue-600 font-bold">{c.plate_number}</td>
                    <td className="p-4">{c.start_date}</td>
                    <td className="p-4 text-green-600">{c.weekly_required} ريال</td>
                    <td className="p-4">{c.total_required} ريال</td>
                    <td className="p-4">
                      <Link to={`/drivers/${c.driver_id}`} className="text-indigo-500 hover:underline mx-2">كشف السائق</Link>
                      <button onClick={() => c.id && handleDelete(c.id)} className="text-red-500 hover:underline mx-2">حذف</button>
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
