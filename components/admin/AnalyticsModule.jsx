"use client";

export default function AnalyticsModule({
  events,
  metrics,
  conversionRate,
  mostClicked,
  chartData,
  leads,
  latestEvents,
  BarList,
  buildCountMap,
  formatDate,
  language = "id"
}) {
  const text = language === "en" ? {
    totalClicks: "Total Clicks",
    conversionRate: "Lead Conversion",
    mostClicked: "Most Clicked",
    newLeads: "New Leads",
    analyticsSummary: "Analytics Summary",
    ownerInsight: "Owner Insights",
    noDominantClick: "No dominant click yet",
    clickInsight: "Website feature attracting the most visitor attention.",
    noDominantCountry: "No dominant country yet",
    countryInsight: "Buyer country that appears most often in inquiries.",
    noDominantProduct: "No dominant product yet",
    productInsight: "Product most frequently requested by buyers.",
    conversionInsight: "Ratio of website clicks converted into incoming leads.",
    featureClicks: "Feature Clicks",
    topClicked: "Most Clicked",
    noClickData: "No click data yet.",
    leadSource: "Lead Source",
    leadOrigin: "Lead Origin",
    noLeadSource: "No lead source data yet.",
    latestActivity: "Latest Activity",
    clickHistory: "Website Click History",
    noWebsiteActivity: "No website activity yet."
  } : {
    totalClicks: "Total Klik",
    conversionRate: "Rasio Jadi Lead",
    mostClicked: "Paling Sering Diklik",
    newLeads: "Prospek Baru",
    analyticsSummary: "Ringkasan Analitik",
    ownerInsight: "Insight Untuk Owner",
    noDominantClick: "Belum ada klik dominan",
    clickInsight: "Fitur website yang paling menarik perhatian visitor.",
    noDominantCountry: "Belum ada negara dominan",
    countryInsight: "Negara buyer yang paling sering muncul di inquiry.",
    noDominantProduct: "Belum ada produk dominan",
    productInsight: "Produk yang paling sering diminta buyer.",
    conversionInsight: "Rasio klik website menjadi prospek masuk.",
    featureClicks: "Klik Fitur",
    topClicked: "Paling Sering Diklik",
    noClickData: "Belum ada data klik.",
    leadSource: "Sumber Prospek",
    leadOrigin: "Asal Lead",
    noLeadSource: "Belum ada data asal lead.",
    latestActivity: "Aktivitas Terbaru",
    clickHistory: "Riwayat Klik Website",
    noWebsiteActivity: "Belum ada aktivitas website."
  };

  return (
    <>
      <section className="admin-metrics analytics">
        <article><span>{text.totalClicks}</span><strong>{events.length}</strong></article>
        <article><span>{text.conversionRate}</span><strong>{conversionRate}%</strong></article>
        <article><span>{text.mostClicked}</span><strong className="text-small">{mostClicked}</strong></article>
        <article><span>{text.newLeads}</span><strong>{metrics.newToday}</strong></article>
      </section>
      <section className="admin-panel admin-analytics-summary">
        <div className="admin-panel-header compact">
          <div>
            <p>{text.analyticsSummary}</p>
            <h2>{text.ownerInsight}</h2>
          </div>
        </div>
        <div className="admin-insight-list">
          <article>
            <strong>{mostClicked || text.noDominantClick}</strong>
            <span>{text.clickInsight}</span>
          </article>
          <article>
            <strong>{chartData.countries[0]?.[0] || text.noDominantCountry}</strong>
            <span>{text.countryInsight}</span>
          </article>
          <article>
            <strong>{chartData.products[0]?.[0] || text.noDominantProduct}</strong>
            <span>{text.productInsight}</span>
          </article>
          <article>
            <strong>{conversionRate}%</strong>
            <span>{text.conversionInsight}</span>
          </article>
        </div>
      </section>
      <section className="admin-chart-grid analytics">
        <div className="admin-panel">
          <div className="admin-panel-header compact"><div><p>{text.featureClicks}</p><h2>{text.topClicked}</h2></div></div>
          <BarList items={chartData.clicks} empty={text.noClickData} />
        </div>
        <div className="admin-panel">
          <div className="admin-panel-header compact"><div><p>{text.leadSource}</p><h2>{text.leadOrigin}</h2></div></div>
          <BarList items={buildCountMap(leads, (lead) => lead.source || "inquiry_form").slice(0, 7)} empty={text.noLeadSource} />
        </div>
        <div className="admin-panel wide">
          <div className="admin-panel-header">
            <div>
              <p>{text.latestActivity}</p>
              <h2>{text.clickHistory}</h2>
            </div>
          </div>
          <div className="admin-event-list">
            {latestEvents.slice(0, 5).map((event) => (
              <article key={event.id}>
                <strong>{event.event}</strong>
                <span>{event.label || event.path || "-"}</span>
                <small>{formatDate(event.created_at)}</small>
              </article>
            ))}
            {!latestEvents.length ? <p className="admin-empty">{text.noWebsiteActivity}</p> : null}
          </div>
        </div>
      </section>
    </>
  );
}
