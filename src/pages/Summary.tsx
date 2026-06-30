import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Summary() {
  const [stats, setStats] = useState({ total_cars: 0, active_cars: 0, total_expected_income: 0, total_actual_income: 0 });

  useEffect(() => {
    fetch("http://localhost:3001/api/summary")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error loading summary:", err));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 mt-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-purple-600">ملخصات وداشبورد</h1>
          <p className="text-gray-500 mt-2">لوحة الإحصائيات السريعة ومراقبة الأسطول والتنبيهات</p>
        </div>
        <Link to="/" className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 shadow-lg">
          العودة للرئيسية
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center transform hover:scale-105 transition-transform">
          <h3 className="text-gray-500 mb-4 text-lg">إجمالي الدخل المتوقع / الفعلي</h3>
          <p className="text-4xl font-bold text-slate-800">
            <span className="text-green-600">{stats.total_actual_income}</span> / {stats.total_expected_income} <span className="text-sm text-gray-400">ريال</span>
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center transform hover:scale-105 transition-transform">
          <h3 className="text-gray-500 mb-4 text-lg">السيارات (نشطة / مسجلة)</h3>
          <p className="text-4xl font-bold text-slate-800">
            <span className="text-blue-500">{stats.active_cars}</span> / <span className="text-orange-500">{stats.total_cars}</span>
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center transform hover:scale-105 transition-transform">
          <h3 className="text-gray-500 mb-4 text-lg">تنبيهات المستندات</h3>
          <p className="text-xl font-medium text-red-500 bg-red-50 px-6 py-3 rounded-lg">لا توجد مستندات منتهية</p>
        </div>
      </div>
    </div>
  );
}
