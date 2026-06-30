import { Link } from "react-router-dom";

export default function Settings() {
  const handleClearData = async () => {
    if (window.confirm("هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه!")) {
      if (window.confirm("تأكيد أخير: سيتم مسح كافة السجلات والمركبات والسائقين. هل تريد المتابعة؟")) {
        try {
          const response = await fetch("http://localhost:3001/api/clear-all", { method: "DELETE" });
          if (response.ok) {
            alert("تم حذف جميع البيانات بنجاح.");
          } else {
            const data = await response.json();
            alert("حدث خطأ أثناء حذف البيانات: " + (data.error || "خطأ غير معروف"));
          }
        } catch (error: any) {
          console.error("Error clearing data:", error);
          alert("حدث خطأ في الاتصال بالخادم: " + error.message);
        }
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 mt-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-600">الإعدادات</h1>
          <p className="text-gray-500 mt-2">إدارة النظام وقاعدة البيانات</p>
        </div>
        <Link to="/" className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 shadow-lg">
          العودة للرئيسية
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 border-r-4 border-r-red-500">
        <h2 className="text-2xl font-bold text-red-600 mb-4">منطقة الخطر</h2>
        <p className="text-gray-600 mb-6 font-medium">تحذير: الإجراءات التالية لا يمكن التراجع عنها. يرجى توخي الحذر عند استخدامها.</p>
        
        <button 
          onClick={handleClearData} 
          className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 shadow-md font-bold text-lg"
        >
          حذف جميع البيانات
        </button>
      </div>
    </div>
  );
}
