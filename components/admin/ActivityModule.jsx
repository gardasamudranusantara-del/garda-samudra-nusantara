"use client";

export default function ActivityModule({
  latestAdminActivities,
  activityFilters,
  setActivityFilters,
  activityAdminOptions,
  activityActionOptions,
  exportRowsCsv,
  getAuditChanges,
  formatAuditValue,
  formatDate
}) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <p>Aktivitas</p>
          <h2>Yang Baru Terjadi</h2>
        </div>
        <button
          disabled={!latestAdminActivities.length}
          onClick={() => exportRowsCsv(
            `gsn-admin-activity-${new Date().toISOString().slice(0, 10)}.csv`,
            ["Created At", "Admin", "Role", "Action", "Label", "Reference Type", "Reference ID", "Changed Fields", "Before", "After", "Details"],
            latestAdminActivities.map((activity) => {
              const changes = getAuditChanges(activity);
              return [
                activity.created_at || "",
                activity.metadata?.admin || "",
                activity.metadata?.role || "",
                activity.metadata?.action || "",
                activity.label || "",
                activity.metadata?.referenceType || activity.path || "",
                activity.metadata?.referenceId || "",
                changes.map((change) => change.field).join("; "),
                changes.map((change) => `${change.field}: ${formatAuditValue(change.before)}`).join("; "),
                changes.map((change) => `${change.field}: ${formatAuditValue(change.after)}`).join("; "),
                JSON.stringify(activity.metadata || {})
              ];
            })
          )}
          type="button"
        >
          Ekspor Aktivitas CSV
        </button>
      </div>
      <div className="admin-activity-summary">
        <article>
          <span>Aktivitas Terakhir</span>
          <strong>{latestAdminActivities[0]?.label || "Belum ada aktivitas"}</strong>
          <small>{latestAdminActivities[0] ? formatDate(latestAdminActivities[0].created_at) : "Mulai gunakan dashboard untuk membuat riwayat."}</small>
        </article>
        <article>
          <span>Admin Aktif</span>
          <strong>{activityAdminOptions.filter((item) => item !== "All").length}</strong>
          <small>Jumlah admin yang muncul di log.</small>
        </article>
        <article>
          <span>Jenis Aksi</span>
          <strong>{activityActionOptions.filter((item) => item !== "All").length}</strong>
          <small>Jenis perubahan yang tercatat.</small>
        </article>
      </div>
      <div className="admin-filter-row activity">
        <select value={activityFilters.admin} onChange={(event) => setActivityFilters((current) => ({ ...current, admin: event.target.value }))}>
          {activityAdminOptions.map((admin) => <option key={admin} value={admin}>{admin === "All" ? "Semua Admin" : admin}</option>)}
        </select>
        <select value={activityFilters.action} onChange={(event) => setActivityFilters((current) => ({ ...current, action: event.target.value }))}>
          {activityActionOptions.map((action) => <option key={action} value={action}>{action === "All" ? "Semua Aksi" : action}</option>)}
        </select>
        <input type="date" value={activityFilters.from} onChange={(event) => setActivityFilters((current) => ({ ...current, from: event.target.value }))} />
        <input type="date" value={activityFilters.to} onChange={(event) => setActivityFilters((current) => ({ ...current, to: event.target.value }))} />
        <button onClick={() => setActivityFilters({ admin: "All", action: "All", from: "", to: "" })} type="button">Reset Filter</button>
      </div>
      <div className="admin-event-list">
        {latestAdminActivities.map((activity) => {
          const changes = getAuditChanges(activity);
          return (
            <article key={activity.id}>
              <strong>{activity.metadata?.admin || "admin"} <span className="admin-role-chip">{activity.metadata?.role || "role"}</span></strong>
              <span>{activity.label || activity.metadata?.action || "Aktivitas admin"}</span>
              {activity.metadata?.quotationNumber ? <em>Quotation: {activity.metadata.quotationNumber}</em> : null}
              {changes.length ? (
                <div className="admin-audit-diff">
                  {changes.slice(0, 6).map((change) => (
                    <div key={change.field}>
                      <b>{change.field}</b>
                      <span>{formatAuditValue(change.before)}</span>
                      <i>menjadi</i>
                      <strong>{formatAuditValue(change.after)}</strong>
                    </div>
                  ))}
                  {changes.length > 6 ? <small>+{changes.length - 6} field lain berubah</small> : null}
                </div>
              ) : null}
              <small>{formatDate(activity.created_at)}</small>
            </article>
          );
        })}
        {!latestAdminActivities.length ? <p className="admin-empty">Belum ada aktivitas admin.</p> : null}
      </div>
    </section>
  );
}
