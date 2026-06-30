import { Link } from "react-router-dom";

export default function Dashboard() {
  const menuItems = [
    {
      title: "ملخصات وداشبورد",
      path: "/summary",
      color: "bg-purple-500",
      shadow: "shadow-purple-500/30",
    },
    {
      title: "المركبات",
      path: "/cars",
      color: "bg-blue-500",
      shadow: "shadow-blue-500/30",
    },
    {
      title: "السائقين",
      path: "/drivers",
      color: "bg-green-500",
      shadow: "shadow-green-500/30",
    },
    {
      title: "قائمة صيانات",
      path: "/maintenance",
      color: "bg-red-500",
      shadow: "shadow-red-500/30",
    },
    {
      title: "المخالفات",
      path: "/violations",
      color: "bg-orange-500",
      shadow: "shadow-orange-500/30",
    },
    {
      title: "السندات",
      path: "/vouchers",
      color: "bg-sky-400",
      shadow: "shadow-sky-400/30",
    },
    {
      title: "الإعدادات",
      path: "/settings",
      color: "bg-slate-600",
      shadow: "shadow-slate-600/30",
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 mt-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-[#1E824C]">مرحباً بك، المدير العام</h1>
        <p className="text-gray-500 text-lg">الواجهة الرئيسية لتطبيقات النظام</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`
              flex items-center justify-center p-8 
              text-white text-2xl font-bold rounded-2xl 
              shadow-lg hover:shadow-xl transition-all duration-300 
              transform hover:-translate-y-1 active:scale-95
              ${item.color} ${item.shadow}
            `}
          >
            {item.title}
          </Link>
        ))}
      </div>

    </div>
  );
}
