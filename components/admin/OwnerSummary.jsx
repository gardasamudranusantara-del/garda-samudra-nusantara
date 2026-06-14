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
  onOpenModule
}) {
  const pendingFollowUps = metrics?.pendingFollowUps || 0;
  const invoicesDue = financeReminders?.arItems?.length || 0;
  const topProduct = chartData?.products?.[0]?.[0] || "Belum ada produk dominan";
  const topCountry = chartData?.countries?.[0]?.[0] || "Belum ada negara dominan";
  const whatsappClicks = findClickCount(chartData?.clicks, ["whatsapp", "wa"]);

  const insights = [
    {
      title: `${pendingFollowUps} prospek perlu follow-up`,
      detail: pendingFollowUps ? "Prioritaskan buyer yang belum dihubungi." : "Belum ada prospek yang menunggu follow-up.",
      module: "Leads",
      tone: pendingFollowUps ? "high" : "calm"
    },
    canUseFinance
      ? {
          title: `${invoicesDue} invoice perlu dipantau`,
          detail: invoicesDue ? "Cek AR dan pembayaran buyer yang mendekati jatuh tempo." : "Tidak ada invoice kritis saat ini.",
          module: "Finance",
          tone: invoicesDue ? "medium" : "calm"
        }
      : null,
    {
      title: topProduct,
      detail: "Produk paling diminati dari data prospek terbaru.",
      module: "Leads",
      tone: "calm"
    },
    {
      title: whatsappClicks ? `${whatsappClicks} klik WhatsApp` : "Belum ada klik WhatsApp",
      detail: mostClicked ? `Fitur paling ramai: ${mostClicked}.` : "Aktivitas klik website akan muncul setelah traffic masuk.",
      module: "Analytics",
      tone: whatsappClicks ? "calm" : "quiet"
    },
    {
      title: topCountry,
      detail: "Negara buyer yang paling sering muncul di inquiry.",
      module: "Analytics",
      tone: "quiet"
    }
  ].filter(Boolean);

  return (
    <section className="admin-panel admin-owner-summary">
      <div className="admin-panel-header">
        <div>
          <p>Ringkasan Owner</p>
          <h2>Apa Yang Perlu Diperhatikan</h2>
        </div>
        <span className="admin-muted">{unreadNotifications?.length || 0} notifikasi belum dibaca</span>
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
