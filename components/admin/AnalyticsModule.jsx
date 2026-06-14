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
  formatDate
}) {
  return (
    <>
      <section className="admin-metrics analytics">
        <article><span>Total Klik</span><strong>{events.length}</strong></article>
        <article><span>Rasio Jadi Lead</span><strong>{conversionRate}%</strong></article>
        <article><span>Paling Sering Diklik</span><strong className="text-small">{mostClicked}</strong></article>
        <article><span>Prospek Baru</span><strong>{metrics.newToday}</strong></article>
      </section>
      <section className="admin-panel admin-analytics-summary">
        <div className="admin-panel-header compact">
          <div>
            <p>Ringkasan Analitik</p>
            <h2>Insight Untuk Owner</h2>
          </div>
        </div>
        <div className="admin-insight-list">
          <article>
            <strong>{mostClicked || "Belum ada klik dominan"}</strong>
            <span>Fitur website yang paling menarik perhatian visitor.</span>
          </article>
          <article>
            <strong>{chartData.countries[0]?.[0] || "Belum ada negara dominan"}</strong>
            <span>Negara buyer yang paling sering muncul di inquiry.</span>
          </article>
          <article>
            <strong>{chartData.products[0]?.[0] || "Belum ada produk dominan"}</strong>
            <span>Produk yang paling sering diminta buyer.</span>
          </article>
          <article>
            <strong>{conversionRate}%</strong>
            <span>Rasio klik website menjadi prospek masuk.</span>
          </article>
        </div>
      </section>
      <section className="admin-chart-grid analytics">
        <div className="admin-panel">
          <div className="admin-panel-header compact"><div><p>Klik Fitur</p><h2>Paling Sering Diklik</h2></div></div>
          <BarList items={chartData.clicks} empty="Belum ada data klik." />
        </div>
        <div className="admin-panel">
          <div className="admin-panel-header compact"><div><p>Sumber Prospek</p><h2>Asal Lead</h2></div></div>
          <BarList items={buildCountMap(leads, (lead) => lead.source || "inquiry_form").slice(0, 7)} empty="Belum ada data asal lead." />
        </div>
        <div className="admin-panel wide">
          <div className="admin-panel-header">
            <div>
              <p>Aktivitas Terbaru</p>
              <h2>Riwayat Klik Website</h2>
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
            {!latestEvents.length ? <p className="admin-empty">Belum ada aktivitas website.</p> : null}
          </div>
        </div>
      </section>
    </>
  );
}
