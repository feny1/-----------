import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function DriverDetails() {
  const { id } = useParams();
  const [driver, setDriver] = useState<any>(null);

  const [financialForm, setFinancialForm] = useState({
    type: 'سند قبض',
    payment_method: 'كاش',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const loadDriver = () => {
    fetch(`http://localhost:3001/api/drivers/${id}`)
      .then(res => res.json())
      .then(data => setDriver(data))
      .catch(err => console.error("Error loading driver:", err));
  };

  useEffect(() => {
    loadDriver();
  }, [id]);

  const handleDeleteStatement = async (statementId: number, category: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الحركة؟ سيتم حذف السجل المرتبط بها بالكامل من النظام.")) {
      let endpoint = "";
      if (category === "contract") endpoint = "contracts";
      else if (category === "violation") endpoint = "violations";
      else if (category === "maintenance") endpoint = "maintenance";
      else if (category === "cash" || category === "network") endpoint = "vouchers";
      
      if (endpoint) {
        try {
          await fetch(`http://localhost:3001/api/${endpoint}/${statementId}`, { method: "DELETE" });
          loadDriver();
        } catch (error) {
          console.error("Error deleting statement:", error);
        }
      }
    }
  };

  const handleFinancialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!financialForm.amount || parseFloat(financialForm.amount) <= 0) return;
    
    try {
      await fetch("http://localhost:3001/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucher_type: financialForm.type,
          voucher_date: financialForm.date,
          amount: parseFloat(financialForm.amount),
          related_driver_id: driver.id,
          description: financialForm.description || (financialForm.type === 'سند قبض' ? 'دفعة من السائق' : 'سلفة للسائق'),
          payment_method: financialForm.payment_method
        })
      });
      alert("تم تسجيل العملية بنجاح!");
      setFinancialForm({ ...financialForm, amount: '', description: '' });
      loadDriver();
    } catch (error) {
      console.error("Error submitting financial op:", error);
    }
  };

  if (!driver) return <div className="p-8 text-center text-slate-500 text-xl font-bold">جاري التحميل...</div>;

  let totalContract = 0, totalAdvance = 0, totalCash = 0, totalNetwork = 0, totalMaintenance = 0, totalViolation = 0;
  if (driver?.statements) {
    driver.statements.forEach((s: any) => {
      if (s.category === 'contract') totalContract += s.debit || 0;
      if (s.category === 'advance') totalAdvance += s.debit || 0;
      if (s.category === 'cash') totalCash += (s.credit || s.debit) || 0;
      if (s.category === 'network') totalNetwork += (s.credit || s.debit) || 0;
      if (s.category === 'maintenance') totalMaintenance += (s.debit || s.credit) || 0;
      if (s.category === 'violation') totalViolation += s.debit || 0;
    });
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 mt-10 print:mt-0 print:p-0 print:max-w-none print:w-full">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-4xl font-bold text-green-500">كشف حساب السائق الشامل</h1>
          <p className="text-gray-500 mt-2">بيانات السائق، العقود، وكل الحركات المالية</p>
        </div>
        <div className="space-x-4 space-x-reverse flex">
          <button onClick={() => window.print()} className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 shadow-lg print:hidden font-bold">
            طباعة الكشف
          </button>
          <Link to={`/drivers/print-vouchers/${driver.id}`} className="bg-sky-600 text-white px-6 py-3 rounded-xl hover:bg-sky-700 shadow-lg print:hidden font-bold">
            طباعة كافة السندات (A4)
          </Link>
          <Link to="/drivers" className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 shadow-lg print:hidden">
            العودة
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-green-600 mb-4 border-b pb-2">بيانات السائق الأساسية</h2>
          <ul className="space-y-3 text-slate-700">
            <li><span className="text-gray-500 w-24 inline-block">الاسم:</span> <span className="font-bold">{driver.name}</span></li>
            <li><span className="text-gray-500 w-24 inline-block">رقم الجوال:</span> {driver.phone}</li>
            <li><span className="text-gray-500 w-24 inline-block">الهوية/الإقامة:</span> {driver.national_id}</li>
            <li><span className="text-gray-500 w-24 inline-block">تاريخ التعيين:</span> {driver.hire_date}</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-blue-500 mb-4 border-b pb-2">العقد الحالي</h2>
          <ul className="space-y-3 text-slate-700">
            {driver.contracts && driver.contracts.length > 0 ? (
              <>
                <li><span className="text-gray-500 w-28 inline-block">المركبة الحالية:</span> المركبة #{driver.contracts[driver.contracts.length - 1].car_id}</li>
                <li><span className="text-gray-500 w-28 inline-block">تاريخ الاستلام:</span> {driver.contracts[driver.contracts.length - 1].start_date}</li>
                <li><span className="text-gray-500 w-28 inline-block">قيمة العقد الأسبوعية:</span> {driver.contracts[driver.contracts.length - 1].weekly_required} ريال</li>
                <li><span className="text-gray-500 w-28 inline-block">إجمالي المطلوب:</span> {driver.contracts[driver.contracts.length - 1].total_required} ريال</li>
                
                <li className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-lg text-slate-800">المطلوب سداده الآن:</span>
                  <span className={`text-2xl font-black px-4 py-2 rounded-lg ${driver.current_week_required > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {driver.current_week_required} ريال
                  </span>
                </li>
              </>
            ) : (
              <li className="text-gray-500 italic">لا يوجد عقد نشط حالياً</li>
            )}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 print:hidden">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">تسجيل عملية مالية (سداد / سلفة)</h2>
        <form onSubmit={handleFinancialSubmit} className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select 
              className="border p-3 rounded-lg bg-white font-bold" 
              value={financialForm.type} 
              onChange={(e) => setFinancialForm({...financialForm, type: e.target.value})}
            >
              <option value="سند قبض" className="text-green-600">سند قبض (دفعة من السائق)</option>
              <option value="سلفة" className="text-purple-600">سند صرف (سلفة للسائق)</option>
            </select>
            
            {financialForm.type === 'سند قبض' ? (
              <select 
                className="border p-3 rounded-lg bg-white" 
                value={financialForm.payment_method} 
                onChange={(e) => setFinancialForm({...financialForm, payment_method: e.target.value})}
              >
                <option value="كاش">كاش</option>
                <option value="شبكة">شبكة</option>
              </select>
            ) : (
              <div className="border p-3 rounded-lg bg-gray-100 text-gray-500 text-center font-bold flex items-center justify-center">كاش/تحويل</div>
            )}
            
            <input type="number" step="0.01" required placeholder="المبلغ" className="border p-3 rounded-lg font-bold text-center" value={financialForm.amount} onChange={(e) => setFinancialForm({...financialForm, amount: e.target.value})} />
            
            <input type="text" placeholder="البيان / ملاحظات" className="border p-3 rounded-lg md:col-span-2" value={financialForm.description} onChange={(e) => setFinancialForm({...financialForm, description: e.target.value})} />
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <input type="date" required className="border p-3 rounded-lg text-gray-500" value={financialForm.date} onChange={(e) => setFinancialForm({...financialForm, date: e.target.value})} />
            <button type="submit" className={`${financialForm.type === 'سند قبض' ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} text-white px-8 py-3 rounded-lg font-bold shadow-lg`}>
              تسجيل {financialForm.type} +
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">كشف الحساب المالي (مدين / دائن)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 border">التاريخ</th>
                <th className="p-3 border">البيان</th>
                <th className="p-3 border text-slate-700">مطلوب للعقد</th>
                <th className="p-3 border text-purple-500">سلفة</th>
                <th className="p-3 border text-green-500">كاش</th>
                <th className="p-3 border text-green-500">شبكة</th>
                <th className="p-3 border text-orange-500">صيانة</th>
                <th className="p-3 border text-red-500">مخالفة</th>
                <th className="p-3 border">الرصيد المتبقي</th>
                <th className="p-3 border">حذف</th>
              </tr>
            </thead>
            <tbody>
              {driver.statements && driver.statements.length > 0 ? (
                driver.statements.map((s: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 text-center">
                    <td className="p-3 border text-right">{s.date}</td>
                    <td className="p-3 border text-right">{s.description}</td>
                    <td className="p-3 border font-bold text-slate-700">{s.category === 'contract' ? s.debit : ''}</td>
                    <td className="p-3 border font-bold text-purple-500">{s.category === 'advance' ? s.debit : ''}</td>
                    <td className="p-3 border font-bold text-green-500">{s.category === 'cash' ? (s.credit || s.debit) : ''}</td>
                    <td className="p-3 border font-bold text-green-500">{s.category === 'network' ? (s.credit || s.debit) : ''}</td>
                    <td className="p-3 border font-bold text-orange-500">{s.category === 'maintenance' ? (s.debit || s.credit) : ''}</td>
                    <td className="p-3 border font-bold text-red-500">{s.category === 'violation' ? s.debit : ''}</td>
                    <td className={`p-3 border font-bold ${s.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>{s.balance}</td>
                    <td className="p-3 border">
                      <button onClick={() => s.id && handleDeleteStatement(s.id, s.category)} className="text-red-500 hover:text-red-700 font-bold" title="حذف هذه الحركة">
                        ✕
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-gray-500 italic border">لا توجد حركات مالية مسجلة</td>
                </tr>
              )}
            </tbody>
            {driver.statements && driver.statements.length > 0 && (
              <tfoot className="bg-slate-100 font-black text-lg border-t-4 border-slate-300">
                <tr className="text-center">
                  <td className="p-4 border text-left" colSpan={2}>الإجمالي العام</td>
                  <td className="p-4 border text-slate-800">{totalContract > 0 ? totalContract : ''}</td>
                  <td className="p-4 border text-purple-700">{totalAdvance > 0 ? totalAdvance : ''}</td>
                  <td className="p-4 border text-green-700">{totalCash > 0 ? totalCash : ''}</td>
                  <td className="p-4 border text-green-700">{totalNetwork > 0 ? totalNetwork : ''}</td>
                  <td className="p-4 border text-orange-600">{totalMaintenance > 0 ? totalMaintenance : ''}</td>
                  <td className="p-4 border text-red-600">{totalViolation > 0 ? totalViolation : ''}</td>
                  <td className="p-4 border text-gray-500 text-sm">--</td>
                  <td className="p-4 border text-gray-500 text-sm">--</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
