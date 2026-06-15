"use client";

export default function AttendanceModule({
  currentAttendance,
  saveAttendance,
  attendanceDraft,
  setAttendanceDraft,
  attendanceStatuses,
  attendanceWorkModes,
  todayKey,
  formatDate,
  attendanceSummary,
  attendanceRecords,
  exportRowsCsv
}) {
  return (
    <section className="admin-attendance-grid">
      <div className="admin-panel admin-attendance-hero">
        <div className="admin-panel-header">
          <div>
            <p>Absensi</p>
            <h2>Check-In Harian Staff</h2>
          </div>
          <span className={`admin-priority ${currentAttendance?.check_in_at ? "medium" : "low"}`}>
            {currentAttendance?.check_in_at ? "Sudah Check-In" : "Belum Check-In"}
          </span>
        </div>
        <div className="admin-attendance-actions">
          <button onClick={() => saveAttendance("check_in")} type="button">Check In</button>
          <button className="ghost" disabled={!currentAttendance?.check_in_at} onClick={() => saveAttendance("check_out")} type="button">Check Out</button>
        </div>
        <div className="admin-form-grid attendance">
          <label>
            Status
            <select value={attendanceDraft.status} onChange={(event) => setAttendanceDraft((current) => ({ ...current, status: event.target.value }))}>
              {attendanceStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label>
            Mode Kerja
            <select value={attendanceDraft.work_mode} onChange={(event) => setAttendanceDraft((current) => ({ ...current, work_mode: event.target.value }))}>
              {attendanceWorkModes.map((mode) => <option key={mode}>{mode}</option>)}
            </select>
          </label>
          <label>
            Lokasi
            <input value={attendanceDraft.location} onChange={(event) => setAttendanceDraft((current) => ({ ...current, location: event.target.value }))} placeholder="Kantor, remote city, kunjungan buyer..." />
          </label>
          <label className="wide">
            Catatan
            <textarea value={attendanceDraft.notes} onChange={(event) => setAttendanceDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Catatan kerja harian, agenda kunjungan, alasan izin..." />
          </label>
        </div>
        <div className="admin-attendance-current">
          <article><span>Hari Ini</span><strong>{todayKey}</strong></article>
          <article><span>Check In</span><strong>{formatDate(currentAttendance?.check_in_at)}</strong></article>
          <article><span>Check Out</span><strong>{formatDate(currentAttendance?.check_out_at)}</strong></article>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header compact"><div><p>Ringkasan Hari Ini</p><h2>Absensi Tim</h2></div></div>
        <div className="admin-attendance-metrics">
          <article><span>Total Hari Ini</span><strong>{attendanceSummary.totalToday}</strong></article>
          <article><span>Hadir / Remote</span><strong>{attendanceSummary.present}</strong></article>
          <article><span>Izin</span><strong>{attendanceSummary.permission}</strong></article>
          <article><span>Belum Check Out</span><strong>{attendanceSummary.notCheckedOut}</strong></article>
        </div>
      </div>

      <div className="admin-panel admin-table-panel wide">
        <div className="admin-panel-header">
          <div>
            <p>Log Absensi</p>
            <h2>Riwayat Terbaru</h2>
          </div>
          <button
            disabled={!attendanceRecords.length}
            onClick={() => exportRowsCsv(
              `gsn-attendance-${new Date().toISOString().slice(0, 10)}.csv`,
              ["Date", "Username", "Role", "Status", "Work Mode", "Check In", "Check Out", "Location", "Notes"],
              attendanceRecords.map((record) => [
                record.attendance_date || "",
                record.username || "",
                record.role || "",
                record.status || "",
                record.work_mode || "",
                record.check_in_at || "",
                record.check_out_at || "",
                record.location || "",
                record.notes || ""
              ])
            )}
            type="button"
          >
            Ekspor CSV
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-mobile-cards attendance">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>User</th>
                <th>Status</th>
                <th>Mode Kerja</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Lokasi</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record.id}>
                  <td data-label="Tanggal">{record.attendance_date || "-"}</td>
                  <td data-label="User"><strong>{record.username || "-"}</strong><span>{record.role || "-"}</span></td>
                  <td data-label="Status"><span className={`admin-priority ${["Permission", "Sick", "Leave"].includes(record.status) ? "medium" : "low"}`}>{record.status || "-"}</span></td>
                  <td data-label="Mode Kerja">{record.work_mode || "-"}</td>
                  <td data-label="Check In">{formatDate(record.check_in_at)}</td>
                  <td data-label="Check Out">{formatDate(record.check_out_at)}</td>
                  <td data-label="Lokasi">{record.location || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!attendanceRecords.length ? <p className="admin-empty table">Belum ada riwayat absensi. Jalankan schema Supabase terbaru, lalu lakukan check-in dari halaman ini.</p> : null}
        </div>
      </div>
    </section>
  );
}
