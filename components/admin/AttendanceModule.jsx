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
  exportRowsCsv,
  language = "id"
}) {
  const text = language === "en" ? {
    attendance: "Attendance",
    dailyCheckIn: "Daily Staff Check-In",
    checkedIn: "Checked In",
    notCheckedIn: "Not Checked In",
    status: "Status",
    workMode: "Work Mode",
    location: "Location",
    locationPlaceholder: "Office, remote city, buyer visit...",
    notes: "Notes",
    notesPlaceholder: "Daily work note, visit agenda, permission reason...",
    today: "Today",
    summaryToday: "Today Summary",
    teamAttendance: "Team Attendance",
    totalToday: "Total Today",
    presentRemote: "Present / Remote",
    permission: "Permission",
    notCheckedOut: "Not Checked Out",
    attendanceLog: "Attendance Log",
    latestHistory: "Latest History",
    exportCsv: "Export CSV",
    date: "Date",
    user: "User",
    noHistory: "No attendance history yet. Run the latest Supabase schema, then check in from this page."
  } : {
    attendance: "Absensi",
    dailyCheckIn: "Check-In Harian Staff",
    checkedIn: "Sudah Check-In",
    notCheckedIn: "Belum Check-In",
    status: "Status",
    workMode: "Mode Kerja",
    location: "Lokasi",
    locationPlaceholder: "Kantor, remote city, kunjungan buyer...",
    notes: "Catatan",
    notesPlaceholder: "Catatan kerja harian, agenda kunjungan, alasan izin...",
    today: "Hari Ini",
    summaryToday: "Ringkasan Hari Ini",
    teamAttendance: "Absensi Tim",
    totalToday: "Total Hari Ini",
    presentRemote: "Hadir / Remote",
    permission: "Izin",
    notCheckedOut: "Belum Check Out",
    attendanceLog: "Log Absensi",
    latestHistory: "Riwayat Terbaru",
    exportCsv: "Ekspor CSV",
    date: "Tanggal",
    user: "User",
    noHistory: "Belum ada riwayat absensi. Jalankan schema Supabase terbaru, lalu lakukan check-in dari halaman ini."
  };

  return (
    <section className="admin-attendance-grid">
      <div className="admin-panel admin-attendance-hero">
        <div className="admin-panel-header">
          <div>
            <p>{text.attendance}</p>
            <h2>{text.dailyCheckIn}</h2>
          </div>
          <span className={`admin-priority ${currentAttendance?.check_in_at ? "medium" : "low"}`}>
            {currentAttendance?.check_in_at ? text.checkedIn : text.notCheckedIn}
          </span>
        </div>
        <div className="admin-attendance-actions">
          <button onClick={() => saveAttendance("check_in")} type="button">Check In</button>
          <button className="ghost" disabled={!currentAttendance?.check_in_at} onClick={() => saveAttendance("check_out")} type="button">Check Out</button>
        </div>
        <div className="admin-form-grid attendance">
          <label>
            {text.status}
            <select value={attendanceDraft.status} onChange={(event) => setAttendanceDraft((current) => ({ ...current, status: event.target.value }))}>
              {attendanceStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label>
            {text.workMode}
            <select value={attendanceDraft.work_mode} onChange={(event) => setAttendanceDraft((current) => ({ ...current, work_mode: event.target.value }))}>
              {attendanceWorkModes.map((mode) => <option key={mode}>{mode}</option>)}
            </select>
          </label>
          <label>
            {text.location}
            <input value={attendanceDraft.location} onChange={(event) => setAttendanceDraft((current) => ({ ...current, location: event.target.value }))} placeholder={text.locationPlaceholder} />
          </label>
          <label className="wide">
            {text.notes}
            <textarea value={attendanceDraft.notes} onChange={(event) => setAttendanceDraft((current) => ({ ...current, notes: event.target.value }))} placeholder={text.notesPlaceholder} />
          </label>
        </div>
        <div className="admin-attendance-current">
          <article><span>{text.today}</span><strong>{todayKey}</strong></article>
          <article><span>Check In</span><strong>{formatDate(currentAttendance?.check_in_at)}</strong></article>
          <article><span>Check Out</span><strong>{formatDate(currentAttendance?.check_out_at)}</strong></article>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header compact"><div><p>{text.summaryToday}</p><h2>{text.teamAttendance}</h2></div></div>
        <div className="admin-attendance-metrics">
          <article><span>{text.totalToday}</span><strong>{attendanceSummary.totalToday}</strong></article>
          <article><span>{text.presentRemote}</span><strong>{attendanceSummary.present}</strong></article>
          <article><span>{text.permission}</span><strong>{attendanceSummary.permission}</strong></article>
          <article><span>{text.notCheckedOut}</span><strong>{attendanceSummary.notCheckedOut}</strong></article>
        </div>
      </div>

      <div className="admin-panel admin-table-panel wide">
        <div className="admin-panel-header">
          <div>
            <p>{text.attendanceLog}</p>
            <h2>{text.latestHistory}</h2>
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
            {text.exportCsv}
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-mobile-cards attendance">
            <thead>
              <tr>
                <th>{text.date}</th>
                <th>{text.user}</th>
                <th>{text.status}</th>
                <th>{text.workMode}</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>{text.location}</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record.id}>
                  <td data-label={text.date}>{record.attendance_date || "-"}</td>
                  <td data-label={text.user}><strong>{record.username || "-"}</strong><span>{record.role || "-"}</span></td>
                  <td data-label={text.status}><span className={`admin-priority ${["Permission", "Sick", "Leave"].includes(record.status) ? "medium" : "low"}`}>{record.status || "-"}</span></td>
                  <td data-label={text.workMode}>{record.work_mode || "-"}</td>
                  <td data-label="Check In">{formatDate(record.check_in_at)}</td>
                  <td data-label="Check Out">{formatDate(record.check_out_at)}</td>
                  <td data-label={text.location}>{record.location || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!attendanceRecords.length ? <p className="admin-empty table">{text.noHistory}</p> : null}
        </div>
      </div>
    </section>
  );
}
