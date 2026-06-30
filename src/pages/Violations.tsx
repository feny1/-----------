import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Removed Tauri invoke import

// We need a helper to fetch contracts or just allow entering contract ID for now.
// For simplicity in this iteration, we'll manually input the contract_id.

export default function Violations() {
  const [violations, setViolations] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const loadData = () => {
    fetch("http://localhost:3001/api/violations")
      .then(res => res.json())
      .then(data => setViolations(data))
      .catch(err => console.error(err));
      
    fetch("http://localhost:3001/api/contracts")
      .then(res => res.json())
      .then(data => setContracts(data))
      .catch(err => console.error(err));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذه المخالفة؟")) {
      try {
        await fetch(`http://localhost:3001/api/violations/${id}`, { method: "DELETE" });
        loadData();
      } catch (error) {
        console.error("Error deleting violation:", error);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [formData, setFormData] = useState({
    contract_id: "",
    amount: "",
    violation_date: new Date().toISOString().split("T")[0],
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:3001/api/violations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_id: parseInt(formData.contract_id),
          amount: parseFloat(formData.amount),
          violation_date: formData.violation_date,
          reason: formData.reason,
        })
      });
      alert("تم تسجيل المخالفة بنجاح");
      setShowForm(false);
      loadData();
      setFormData({
        contract_id: "",
        amount: "",
        violation_date: new Date().toISOString().split("T")[0],
        reason: "",
      });
    } catch (error) {
      console.error("Error adding violation:", error);
      alert("حدث خطأ أثناء الإضافة: " + error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 mt-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-orange-500">المخالفات</h1>
          <p className="text-gray-500 mt-2">تسجيل ومتابعة مخالفات المركبات والعقود</p>
        </div>
        <Link to="/" className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 shadow-lg">
          العودة للرئيسية
        </Link>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">تسجيل مخالفة جديدة</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select 
                className="border p-3 rounded-lg bg-white" 
                value={formData.contract_id} 
                onChange={(e) => setFormData({...formData, contract_id: e.target.value})} 
                required
              >
                <option value="">-- اختر العقد (اللوحة | السائق) --</option>
                {contracts.map(c => (
                  <option key={c.id} value={c.id}>{c.plate_number} | {c.driver_name}</option>
                ))}
              </select>
              <input type="number" placeholder="قيمة المخالفة" required className="border p-3 rounded-lg" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              <input type="date" placeholder="تاريخ المخالفة" required className="border p-3 rounded-lg" value={formData.violation_date} onChange={(e) => setFormData({...formData, violation_date: e.target.value})} />
              <input type="text" placeholder="سبب المخالفة" required className="border p-3 rounded-lg" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
            </div>
            <div className="flex gap-4 mt-6">
              <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">حفظ المخالفة</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">قائمة المخالفات</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">تسجيل مخالفة جديدة</button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4 rounded-tr-lg">رقم العقد</th>
                <th className="p-4">تاريخ المخالفة</th>
                <th className="p-4">قيمة المخالفة</th>
                <th className="p-4">سبب المخالفة</th>
                <th className="p-4 rounded-tl-lg">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {violations.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-4 text-gray-500">لا توجد مخالفات مسجلة</td></tr>
              ) : (
                violations.map(v => (
                  <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 font-bold">{v.contract_id}</td>
                    <td className="p-4">{v.violation_date}</td>
                    <td className="p-4 text-orange-500 font-bold">{v.amount} ريال</td>
                    <td className="p-4">{v.reason}</td>
                    <td className="p-4">
                      <button className="text-orange-500 hover:underline mx-2">التفاصيل</button>
                      <button onClick={() => v.id && handleDelete(v.id)} className="text-red-500 hover:underline mx-2">حذف</button>
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
