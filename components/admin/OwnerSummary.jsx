"use client";

function findClickCount(items = [], keywords = []) {
  const match = items.find(([label]) => {
    const normalized = String(label || "").toLowerCase();
    return keywords.some((keyword) => normalized.includes(keyword));
  });

  return match?.[1] || 0;
}

export default function OwnerSummary({
  metrics,
  financeReminders,
  chartData,
  mostClicked,
  unreadNotifications,
  canUseFinance,
  onOpenModule,
  language = "id"
}) {
  const isEnglish = language === "en";
  const pendingFollowUps = metrics?.pendingFollowUps || 0;
  const invoicesDue = financeReminders?.arItems?.length || 0;
  const topProduct = chartData?.products?.[0]?.[0] || (isEnglish ? "No dominant product yet" : "Belum ada produk dominan");
  const topCountry = chartData?.countries?.[0]?.[0] || (isEnglish ? "No dominant country yet" : "Belum ada negara dominan");
  const whatsappClicks = findClickCount(chartData?.clicks, ["whatsapp", "wa"]);

  const insights = [
    {
      title: isEnglish ? `${pendingFollowUps} leads need follow-up` : `${pendingFollowUps} prospek perlu follow-up`,
      detail: pendingFollowUps
        ? (isEnglish ? "Prioritize buyers who have not been contacted." : "Prioritaskan buyer yang belum dihubungi.")
        : (isEnglish ? "No leads are waiting for follow-up." : "Belum ada prospek yang menunggu follow-up."),
      module: "Leads",
      tone: pendingFollowUps ? "high" : "calm"
    },
    canUseFinance
      ? {
          title: isEnglish ? `${invoicesDue} invoices need attention` : `${invoicesDue} invoice perlu dipantau`,
          detail: invoicesDue
            ? (isEnglish ? "Check AR and buyer payments approaching due dates." : "Cek AR dan pembayaran buyer yang mendekati jatuh tempo.")
            : (isEnglish ? "No critical invoices at the moment." : "Tidak ada invoice kritis saat ini."),
          module: "Finance",
          tone: invoicesDue ? "medium" : "calm"
        }
      : null,
    {
      title: topProduct,
      detail: isEnglish ? "Most requested product from recent lead data." : "Produk paling diminati dari data prospek terbaru.",
      module: "Leads",
      tone: "calm"
    },
    {
      title: whatsappClicks ? (isEnglish ? `${whatsappClicks} WhatsApp clicks` : `${whatsappClicks} klik WhatsApp`) : (isEnglish ? "No WhatsApp clicks yet" : "Belum ada klik WhatsApp"),
      detail: mostClicked
        ? (isEnglish ? `Most active feature: ${mostClicked}.` : `Fitur paling ramai: ${mostClicked}.`)
        : (isEnglish ? "Website click activity will appear after traffic comes in." : "Aktivitas klik website akan muncul setelah traffic masuk."),
      module: "Analytics",
      tone: whatsappClicks ? "calm" : "quiet"
    },
    {
      title: topCountry,
      detail: isEnglish ? "Buyer country that appears most often in inquiries." : "Negara buyer yang paling sering muncul di inquiry.",
      module: "Analytics",
      tone: "quiet"
    }
  ].filter(Boolean);

  return (
    <section className="admin-panel admin-owner-summary">
      <div className="admin-panel-header">
        <div>
          <p>{isEnglish ? "Owner Summary" : "Ringkasan Owner"}</p>
          <h2>{isEnglish ? "What Needs Attention" : "Apa Yang Perlu Diperhatikan"}</h2>
        </div>
        <span className="admin-muted">
          {isEnglish ? `${unreadNotifications?.length || 0} unread notifications` : `${unreadNotifications?.length || 0} notifikasi belum dibaca`}
        </span>
      </div>
      <div className="admin-owner-grid">
        {insights.map((insight) => (
          <button className={`admin-owner-card ${insight.tone}`} key={`${insight.module}-${insight.title}`} onClick={() => onOpenModule?.(insight.module)} type="button">
            <strong>{insight.title}</strong>
            <span>{insight.detail}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
