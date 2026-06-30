import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";

const PRINT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  @media print {
    @page { size: A4 portrait; margin: 12mm; }
    body { background: white !important; }
    .no-print { display: none !important; }
    .page-break { page-break-after: always; break-after: page; }
  }
  * { box-sizing: border-box; }
`;

const S = {
  page: {
    fontFamily: "'Cairo', 'Arial', sans-serif",
    width: "210mm",
    minHeight: "297mm",
    margin: "0 auto",
    padding: "16mm 14mm",
    background: "white",
    color: "#000",
    fontSize: 14,
    lineHeight: 1.9,
  } as React.CSSProperties,
  outerBorder: {
    border: "3px solid #000",
    padding: "14px 18px",
    minHeight: "255mm",
    display: "flex",
    flexDirection: "column",
  } as React.CSSProperties,
  innerBorder: {
    border: "1px solid #000",
    padding: "10px 14px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "2px solid #000",
    paddingBottom: 10,
    marginBottom: 14,
  } as React.CSSProperties,
  typeBadge: {
    border: "2px solid #000",
    padding: "5px 18px",
    textAlign: "center",
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: 2,
  } as React.CSSProperties,
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
    fontSize: 13,
  } as React.CSSProperties,
  underline: {
    borderBottom: "1px solid #000",
    paddingBottom: 2,
    minWidth: 90,
    display: "inline-block",
    textAlign: "center",
    fontWeight: 700,
  } as React.CSSProperties,
  contentBox: {
    border: "1px solid #000",
    padding: "16px 20px",
    marginBottom: 20,
  } as React.CSSProperties,
  fieldRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 14,
    fontSize: 15,
  } as React.CSSProperties,
  fieldLabel: {
    fontWeight: 700,
    whiteSpace: "nowrap",
    minWidth: 190,
  } as React.CSSProperties,
  fieldValue: {
    borderBottom: "1px solid #000",
    flex: 1,
    fontWeight: 700,
    paddingBottom: 2,
    textAlign: "center",
  } as React.CSSProperties,
  totalBox: {
    marginTop: 16,
    border: "2px solid #000",
    padding: "9px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as React.CSSProperties,
  sigGrid: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginTop: "auto",
    paddingTop: 20,
  } as React.CSSProperties,
  footer: {
    borderTop: "1px solid #ccc",
    marginTop: 20,
    paddingTop: 8,
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    color: "#666",
  } as React.CSSProperties,
};

function CompanyHeader() {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 900 }}>مؤسسة أجرة لتقنية المعلومات</div>
      <div style={{ fontSize: 11, color: "#444", marginTop: 3 }}>إدارة أسطول المركبات — المملكة العربية السعودية</div>
    </div>
  );
}

function DocFooter({ num }: { num: string }) {
  return (
    <div style={S.footer}>
      <span>هذه الوثيقة صادرة إلكترونياً ومعتمدة من المؤسسة</span>
      <span>رقم الوثيقة: {num} | أجرة © {new Date().getFullYear()}</span>
    </div>
  );
}

function Sigs({ labels }: { labels: string[] }) {
  return (
    <div style={S.sigGrid}>
      {labels.map((lbl, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{lbl}</div>
          <div style={{ borderBottom: "1px solid #000", marginTop: 48, marginBottom: 4 }} />
          <div style={{ fontSize: 11, color: "#666" }}>التوقيع والختم</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// سند قبض / سند صرف / سلفة
// ─────────────────────────────────────────────
function FinancialVoucher({ v }: { v: any }) {
  const isReceipt = v.voucher_type === "سند قبض";
  const title = isReceipt ? "سنـد قبـض" : "سنـد صـرف";
  const verb = isReceipt ? "استلمنا من السيد/ة" : "صرفنا للسيد/ة";
  const amount = v.amount ?? (isReceipt ? (v.credit || v.debit) : v.debit) ?? 0;
  const payMethod = v.payment_method || (v.category === "network" ? "شبكة" : "كاش");
  const vNum = v.voucher_number || `V-${v.id}`;
  const date = v.voucher_date || v.date || "";
  const name = v.driver_name || "________________________________";

  return (
    <div dir="rtl" style={S.page}>
      <div style={S.outerBorder}>
        <div style={S.innerBorder}>
          <div style={S.header}>
            <CompanyHeader />
            <div style={S.typeBadge}>{title}</div>
          </div>

          <div style={S.metaRow}>
            <div><b>رقم السند:</b> <span style={S.underline}>{vNum}</span></div>
            <div><b>طريقة الدفع:</b> <span style={S.underline}>{payMethod}</span></div>
            <div><b>التاريخ:</b> <span style={S.underline}>{date}</span></div>
          </div>

          <div style={S.contentBox}>
            <div style={S.fieldRow}>
              <span style={S.fieldLabel}>{verb}:</span>
              <span style={{ ...S.fieldValue, fontSize: 17 }}>{name}</span>
            </div>
            <div style={S.fieldRow}>
              <span style={S.fieldLabel}>مبلغاً وقدره بالأرقام:</span>
              <span style={{ ...S.fieldValue, fontSize: 17 }}>{amount} ريال سعودي</span>
            </div>
            <div style={S.fieldRow}>
              <span style={S.fieldLabel}>المبلغ بالحروف:</span>
              <span style={{ ...S.fieldValue, color: "#333", fontWeight: 400 }}>_________________________________________________ ريالاً سعودياً لا غير</span>
            </div>
            <div style={S.fieldRow}>
              <span style={S.fieldLabel}>وذلك بموجب / عن:</span>
              <span style={S.fieldValue}>{v.description || "________________________"}</span>
            </div>
            {v.plate_number && (
              <div style={S.fieldRow}>
                <span style={S.fieldLabel}>رقم لوحة المركبة:</span>
                <span style={S.fieldValue}>{v.plate_number}</span>
              </div>
            )}
            <div style={S.totalBox}>
              <span style={{ fontWeight: 900, fontSize: 15 }}>إجمالي المبلغ</span>
              <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 1 }}>{amount} ر.س</span>
            </div>
          </div>

          <Sigs labels={["المستلم / الدافع", "المحاسب / مدير المؤسسة"]} />
          <DocFooter num={vNum} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// سند تسليم مركبة (A4 مضغوط في صفحة واحدة)
// ─────────────────────────────────────────────
function HandoverVoucher({ v }: { v: any }) {
  const contract = v.contract || {};
  const vNum = v.voucher_number || `V-${v.id}`;
  const date = v.voucher_date || v.date || "";

  const FR = ({ lbl, val }: { lbl: string; val: string }) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6, fontSize: 12 }}>
      <span style={{ fontWeight: 700, whiteSpace: "nowrap", minWidth: 130, fontSize: 11 }}>{lbl}:</span>
      <span style={{ borderBottom: "1px solid #000", flex: 1, fontWeight: 700, paddingBottom: 1, textAlign: "center" }}>
        {val || "___________"}
      </span>
    </div>
  );

  return (
    <div dir="rtl" style={{
      fontFamily: "'Cairo','Arial',sans-serif",
      width: "210mm",
      height: "297mm",
      margin: "0 auto",
      padding: "10mm 12mm",
      background: "white",
      color: "#000",
      lineHeight: 1.55,
      overflow: "hidden",
      boxSizing: "border-box",
    }}>
      <div style={{ border: "3px solid #000", height: "100%", padding: "8px 12px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ border: "1px solid #000", flex: 1, padding: "6px 10px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #000", paddingBottom: 6, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900 }}>مؤسسة أجرة لتقنية المعلومات</div>
              <div style={{ fontSize: 10, color: "#444" }}>إدارة أسطول المركبات — المملكة العربية السعودية</div>
            </div>
            <div style={{ border: "2px solid #000", padding: "3px 14px", fontSize: 16, fontWeight: 900, letterSpacing: 2 }}>سند تسليم مركبة</div>
          </div>

          {/* Meta */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
            <div><b>رقم السند: </b><span style={{ borderBottom: "1px solid #000", minWidth: 90, display: "inline-block", textAlign: "center", paddingBottom: 1 }}>{vNum}</span></div>
            <div><b>تاريخ التسليم: </b><span style={{ borderBottom: "1px solid #000", minWidth: 90, display: "inline-block", textAlign: "center", paddingBottom: 1 }}>{date}</span></div>
          </div>

          {/* Driver + Vehicle — side by side grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div style={{ border: "1px solid #000", padding: "5px 8px" }}>
              <div style={{ fontWeight: 900, fontSize: 11, borderBottom: "1px solid #000", marginBottom: 6, paddingBottom: 2 }}>بيانات السائق المستلم</div>
              <FR lbl="اسم السائق" val={v.driver_name} />
              <FR lbl="رقم الهوية / الإقامة" val={v.driver_national_id} />
              <FR lbl="رقم الجوال" val={v.driver_phone} />
              <FR lbl="تاريخ الاستلام" val={date} />
            </div>
            <div style={{ border: "1px solid #000", padding: "5px 8px" }}>
              <div style={{ fontWeight: 900, fontSize: 11, borderBottom: "1px solid #000", marginBottom: 6, paddingBottom: 2 }}>بيانات المركبة المسلَّمة</div>
              <FR lbl="الماركة / الموديل" val={v.car_company && v.car_model ? `${v.car_company} ${v.car_model}` : ""} />
              <FR lbl="سنة الصنع" val={v.car_year ? String(v.car_year) : ""} />
              <FR lbl="اللون" val={v.car_color} />
              <FR lbl="رقم اللوحة" val={v.plate_number} />
            </div>
          </div>

          {/* Contract Terms */}
          <div style={{ border: "1px solid #000", padding: "5px 8px", marginBottom: 8 }}>
            <div style={{ fontWeight: 900, fontSize: 11, borderBottom: "1px solid #000", marginBottom: 6, paddingBottom: 2 }}>شروط العقد والالتزامات</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px", marginBottom: 6 }}>
              <FR lbl="الإيجار الأسبوعي" val={contract.weekly_required ? `${contract.weekly_required} ريال سعودي` : ""} />
              <FR lbl="تاريخ بداية العقد" val={contract.start_date} />
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.75 }}>
              {[
                "يلتزم السائق بسداد الإيجار الأسبوعي في موعده المحدد دون تأخير.",
                "يتحمل السائق مسؤولية أي مخالفات مرورية تصدر بحق المركبة خلال فترة استلامه لها.",
                "يلتزم السائق بالمحافظة على المركبة وإعادتها في حالتها الأصلية عند انتهاء العقد.",
                "في حال تعرّض المركبة لحادث أو عطل، يُخطر السائق المؤسسة فوراً.",
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 5, marginBottom: 2 }}>
                  <span>•</span><span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: "auto", paddingTop: 8 }}>
            {["توقيع السائق المستلم", "ممثل المؤسسة / المسلِّم"].map((lbl, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 11 }}>{lbl}</div>
                <div style={{ borderBottom: "1px solid #000", marginTop: 32, marginBottom: 3 }} />
                <div style={{ fontSize: 10, color: "#666" }}>التوقيع والختم</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid #ccc", marginTop: 6, paddingTop: 4, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#666" }}>
            <span>هذه الوثيقة صادرة إلكترونياً ومعتمدة من المؤسسة</span>
            <span>رقم الوثيقة: {vNum} | أجرة © {new Date().getFullYear()}</span>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Router — picks the right component
// ─────────────────────────────────────────────
export function VoucherDocument({ voucher }: { voucher: any }) {
  if (voucher.voucher_type === "سند تسليم مركبة") return <HandoverVoucher v={voucher} />;
  return <FinancialVoucher v={voucher} />;
}

export default function VoucherPrint() {
  const { id } = useParams();
  const [voucher, setVoucher] = useState<any>(null);

  const printedRef = useRef(false);

  useEffect(() => {
    fetch(`http://localhost:3001/api/vouchers/${id}`)
      .then(res => res.json())
      .then(data => {
        setVoucher(data);
        if (!printedRef.current) {
          printedRef.current = true;
          setTimeout(() => window.print(), 700);
        }
      });
  }, [id]);

  if (!voucher) return <div style={{ padding: 40, textAlign: "center", fontFamily: "Cairo" }}>جاري التحميل...</div>;

  return (
    <>
      <style>{PRINT_STYLE}</style>
      <div className="no-print" style={{ padding: 16 }}>
        <Link to="/vouchers" style={{ background: "#1e293b", color: "white", padding: "8px 16px", borderRadius: 6, textDecoration: "none", fontFamily: "Cairo", fontWeight: 700 }}>
          ← العودة للسندات
        </Link>
      </div>
      <VoucherDocument voucher={voucher} />
    </>
  );
}
