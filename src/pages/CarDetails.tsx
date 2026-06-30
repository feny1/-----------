import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState<any>(null);
  
  const [docFormData, setDocFormData] = useState({
    document_type: "",
    document_number: "",
    expiry_date: "",
    notes: ""
  });

  const loadCar = () => {
    fetch(`http://localhost:3001/api/cars/${id}`)
      .then(res => res.json())
      .then(data => setCar(data))
      .catch(err => console.error("Error loading car:", err));
  };

  useEffect(() => {
    loadCar();
  }, [id]);

  const handleDeleteMaintenance = async (maintenanceId: number) => {
    if (window.confirm("هل أنت متأكد من حذف سجل الصيانة هذا؟")) {
      try {
        await fetch(`http://localhost:3001/api/maintenance/${maintenanceId}`, { method: "DELETE" });
        loadCar();
      } catch (error) {
        console.error("Error deleting maintenance:", error);
      }
    }
  };

  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:3001/api/car_documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...docFormData, car_id: car.id })
      });
      alert("تمت إضافة المستند بنجاح!");
      setDocFormData({ document_type: "", document_number: "", expiry_date: "", notes: "" });
      loadCar();
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  if (!car) return <div className="p-8 text-center text-slate-500 text-xl font-bold">جاري التحميل...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 mt-10 print:mt-0 print:p-0 print:max-w-none print:w-full">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-4xl font-bold text-blue-600">صفحة المركبة الشاملة</h1>
          <p className="text-gray-500 mt-2">بيانات المركبة، السائقين، ونسبة التغطية وجدول السندات الزمني</p>
        </div>
        <div className="space-x-4 space-x-reverse flex">
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 shadow-lg print:hidden">
            طباعة التقرير
          </button>
          <Link to="/cars" className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 shadow-lg print:hidden">
            العودة
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">بيانات المركبة الأساسية</h2>
          <ul className="space-y-3 text-slate-700">
            <li><span className="text-gray-500 w-24 inline-block">النوع:</span> {car.company} {car.model}</li>
            <li><span className="text-gray-500 w-24 inline-block">اللوحة:</span> <span className="font-bold">{car.plate_number}</span></li>
            <li><span className="text-gray-500 w-24 inline-block">سنة الصنع:</span> {car.year}</li>
            <li><span className="text-gray-500 w-24 inline-block">سعر الشراء:</span> {car.purchase_cost} ريال</li>
            <li><span className="text-gray-500 w-24 inline-block">الإهلاك:</span> {car.depreciation_method}</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-orange-500 mb-4 border-b pb-2">السائق الحالي للمركبة</h2>
          <ul className="space-y-3 text-slate-700">
            {car.current_driver ? (
              <>
                <li className="flex items-center space-x-4 space-x-reverse">
                  <span className="w-32 text-gray-500">اسم السائق:</span>
                  <span className="font-bold">{car.current_driver.name}</span>
                </li>
                <li className="flex items-center space-x-4 space-x-reverse">
                  <span className="w-32 text-gray-500">تاريخ التسليم:</span>
                  <span>{car.current_driver.start_date}</span>
                </li>
              </>
            ) : (
              <li className="text-gray-500 italic">لا يوجد سائق مرتبط حالياً</li>
            )}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">الجدول الزمني الموحد (Timeline)</h2>
        <div className="relative border-r-2 border-slate-200 pr-6 space-y-6">
          {car.maintenance && car.maintenance.length > 0 ? car.maintenance.map((m: any, i: number) => (
            <div key={i} className="relative">
              <span className="absolute -right-8 top-1 w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow"></span>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-red-600">صيانة دورية</h3>
                  <span className="text-sm text-gray-500">مسافة: {m.kilometers} كم</span>
                  <button onClick={() => m.id && handleDeleteMaintenance(m.id)} className="text-red-500 hover:underline">حذف</button>
                </div>
                <p className="text-slate-600">التكلفة: {m.cost} ريال | تغيير زيت: {m.oil_change ? 'نعم' : 'لا'} | تغيير فلتر: {m.filter_change ? 'نعم' : 'لا'}</p>
                {(m.amount_from_driver > 0 || m.deducted_from_weekly > 0) && (
                  <p className="text-sm text-gray-500 mt-2">
                    مطلوب من السائق: {m.amount_from_driver} ريال | محسوم من السائق: {m.deducted_from_weekly} ريال
                  </p>
                )}
              </div>
            </div>
          )) : (
            <div className="text-gray-500 italic">لا توجد حركات صيانة مسجلة حتى الآن</div>
          )}
        </div>
      </div>

      {/* Car Documents Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">مستندات المركبة (استمارة، تأمين، فحص)</h2>
        
        <form onSubmit={handleDocSubmit} className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select 
              className="border p-3 rounded-lg bg-white" 
              value={docFormData.document_type} 
              onChange={(e) => setDocFormData({...docFormData, document_type: e.target.value})} 
              required
            >
              <option value="">-- نوع المستند --</option>
              <option value="استمارة">استمارة سير</option>
              <option value="تأمين">وثيقة تأمين</option>
              <option value="فحص دوري">فحص دوري</option>
              <option value="كرت تشغيل">كرت تشغيل</option>
              <option value="أخرى">أخرى</option>
            </select>
            <input type="text" placeholder="رقم المستند" className="border p-3 rounded-lg" value={docFormData.document_number} onChange={(e) => setDocFormData({...docFormData, document_number: e.target.value})} />
            <input type="date" required className="border p-3 rounded-lg text-gray-500" title="تاريخ الانتهاء" value={docFormData.expiry_date} onChange={(e) => setDocFormData({...docFormData, expiry_date: e.target.value})} />
            <input type="text" placeholder="ملاحظات" className="border p-3 rounded-lg" value={docFormData.notes} onChange={(e) => setDocFormData({...docFormData, notes: e.target.value})} />
          </div>
          <button type="submit" className="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 w-full md:w-auto mt-4 font-bold">
            إضافة مستند +
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 border-b-2 border-slate-200">
              <tr>
                <th className="p-3 border">نوع المستند</th>
                <th className="p-3 border">رقم المستند</th>
                <th className="p-3 border">تاريخ الانتهاء</th>
                <th className="p-3 border">ملاحظات</th>
                <th className="p-3 border">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {car.documents && car.documents.length > 0 ? (
                car.documents.map((d: any, i: number) => {
                  const isExpired = new Date(d.expiry_date) < new Date();
                  return (
                    <tr key={i} className="hover:bg-slate-50 text-center">
                      <td className="p-3 border font-bold text-slate-700">{d.document_type}</td>
                      <td className="p-3 border">{d.document_number || '-'}</td>
                      <td className={`p-3 border font-bold ${isExpired ? 'text-red-500 bg-red-50' : 'text-green-600'}`}>{d.expiry_date}</td>
                      <td className="p-3 border text-gray-500">{d.notes || '-'}</td>
                      <td className="p-3 border">
                        <button onClick={async () => {
                          if (window.confirm("حذف هذا المستند؟")) {
                            await fetch(`http://localhost:3001/api/car_documents/${d.id}`, { method: "DELETE" });
                            loadCar();
                          }
                        }} className="text-red-500 hover:underline font-bold">حذف</button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500 italic border">لا يوجد مستندات مسجلة لهذه المركبة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
