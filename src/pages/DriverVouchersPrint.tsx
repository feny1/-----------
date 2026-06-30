import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { VoucherDocument } from "./VoucherPrint";

export default function DriverVouchersPrint() {
  const { id } = useParams();
  const [data, setData] = useState<{ driver: any; vouchers: any[] } | null>(null);
  const printedRef = useRef(false);

  useEffect(() => {
    // Fetch driver info
    fetch(`http://localhost:3001/api/drivers/${id}`)
      .then(res => res.json())
      .then(async driver => {
        // Fetch full vouchers list with car/contract details
        const allVouchers = await fetch("http://localhost:3001/api/vouchers")
          .then(r => r.json());

        // Get only vouchers related to this driver
        const driverVouchers = allVouchers.filter((v: any) => v.related_driver_id === driver.id);

        // For each voucher, fetch full details (to get car info + contract for handover)
        const detailed = await Promise.all(
          driverVouchers.map((v: any) =>
            fetch(`http://localhost:3001/api/vouchers/${v.id}`).then(r => r.json())
          )
        );

        setData({ driver, vouchers: detailed });
        if (!printedRef.current) {
          printedRef.current = true;
          setTimeout(() => window.print(), 900);
        }
      });
  }, [id]);

  if (!data) return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "Cairo", fontSize: 18 }}>
      جاري تحميل السندات...
    </div>
  );

  const { driver, vouchers } = data;

  if (vouchers.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "Cairo" }}>
        <p style={{ fontSize: 18, color: "#64748b" }}>لا توجد سندات مسجلة لهذا السائق</p>
        <Link to={`/drivers/${id}`} style={{ marginTop: 16, display: "inline-block", background: "#1e293b", color: "white", padding: "8px 16px", borderRadius: 6, textDecoration: "none" }}>
          العودة
        </Link>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; break-after: page; }
        }
        * { box-sizing: border-box; }
      `}</style>

      <div className="no-print" style={{ padding: 16, background: "#f1f5f9", display: "flex", alignItems: "center", gap: 16, fontFamily: "Cairo" }}>
        <Link to={`/drivers/${id}`} style={{ background: "#1e293b", color: "white", padding: "8px 16px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>
          ← العودة لكشف الحساب
        </Link>
        <span style={{ color: "#475569", fontWeight: 700 }}>
          السائق: {driver.name} — {vouchers.length} سند
        </span>
      </div>

      {vouchers.map((v: any, index: number) => (
        <div key={v.id} className={index < vouchers.length - 1 ? "page-break" : ""}>
          <VoucherDocument voucher={v} />
        </div>
      ))}
    </>
  );
}
