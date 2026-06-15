"use client";

export default function FinanceOverview({
  financeView,
  setFinanceView,
  showFinanceDetail,
  setShowFinanceDetail,
  financeDisclosureTabs,
  financeMenus,
  financeMetrics,
  financeReminders,
  financeLockDraft,
  setFinanceLockDraft,
  closingChecklist,
  financePeriodLocks,
  cashFlowVisual,
  financePermissions,
  storageStatus,
  formatMoney,
  scrollToFinanceForm,
  testFinanceOwnerAlerts,
  saveFinancePeriodLock,
  reopenFinancePeriodLock,
  checkFinanceStorageStatus,
  prepareFinanceStorage
}) {
  return (
    <>
      <div className="admin-panel wide">
        <div className="admin-panel-header">
          <div>
            <p>Keuangan</p>
            <h2>{financeDisclosureTabs.find((tab) => tab.id === financeView)?.label || "Dashboard Keuangan"}</h2>
          </div>
          <div className="admin-actions">
            <span className="admin-muted">IDR / USD / SGD</span>
            <button onClick={() => {
              setShowFinanceDetail((value) => {
                const next = !value;
                if (!next) {
                  setFinanceView("overview");
                }
                return next;
              });
            }} type="button">
              {showFinanceDetail ? "Tampilkan Ringkasan" : "Pilih Kategori Detail"}
            </button>
          </div>
        </div>
        <div className="admin-disclosure-tabs" aria-label="Kategori finance">
          {financeDisclosureTabs.map((tab) => (
            <button
              className={financeView === tab.id ? "is-active" : ""}
              key={tab.id}
              onClick={() => {
                setFinanceView(tab.id);
                setShowFinanceDetail(tab.id !== "overview");
              }}
              type="button"
            >
              <strong>{tab.label}</strong>
              <span>{tab.hint}</span>
            </button>
          ))}
        </div>
        <div className="admin-finance-menu">
          {financeMenus.map((menu) => (
            <article className={menu === "Audit" ? "secure" : ""} key={menu}>
              <strong>{menu}</strong>
              <span>{menu === "Dashboard" ? "Ringkasan utama finance." :
                menu === "Kas & Bank" ? "Saldo, kas kecil, dan mutasi." :
                menu === "Penjualan" ? "Pemasukan, invoice, dan AR." :
                menu === "Pembelian" ? "Pengeluaran, AP, dan supplier payment." :
                menu === "Pajak & Legal" ? "Catatan pajak dan dokumen legal." :
                menu === "Anggaran" ? "Budget dan perencanaan." :
                menu === "Laporan" ? "Export laporan finance." :
                "Audit finance dan akses internal."}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="admin-panel wide">
        <div className="admin-panel-header compact"><div><p>KPI Utama</p><h2>Angka Yang Perlu Dipantau</h2></div></div>
        <div className="admin-metrics finance">
          <article><span>Saldo Perusahaan</span><strong>{formatMoney(financeMetrics.cashBalanceByCurrency.IDR || 0, "IDR")}</strong></article>
          <article><span>Pendapatan Bulan Ini</span><strong>{formatMoney(financeMetrics.revenueByCurrency.IDR || 0, "IDR")}</strong></article>
          <article><span>Pengeluaran Bulan Ini</span><strong>{formatMoney(financeMetrics.expenseByCurrency.IDR || 0, "IDR")}</strong></article>
          <article><span>Laba Bersih</span><strong>{formatMoney(financeMetrics.netProfit, "IDR")}</strong></article>
          <article><span>Piutang Buyer</span><strong>{formatMoney(financeMetrics.receivableByCurrency.IDR || 0, "IDR")}</strong></article>
          <article><span>Tagihan Supplier</span><strong>{formatMoney(financeMetrics.payableByCurrency.IDR || 0, "IDR")}</strong></article>
        </div>
      </div>

      <div className="admin-panel wide admin-mobile-finance-flow">
        <div className="admin-panel-header compact">
          <div>
            <p>Aksi Cepat</p>
            <h2>Pilih Yang Ingin Dicatat</h2>
          </div>
          <span className="admin-muted">Form detail akan terbuka saat dibutuhkan</span>
        </div>
        <div className="admin-finance-steps">
          <button onClick={() => scrollToFinanceForm("finance-cash-form")} type="button"><span>01</span><strong>Kas / Bank</strong><small>Buka kategori kas dan bank.</small></button>
          <button onClick={() => scrollToFinanceForm("finance-revenue-form")} type="button"><span>02</span><strong>Pemasukan</strong><small>Buka kategori penjualan.</small></button>
          <button onClick={() => scrollToFinanceForm("finance-expense-form")} type="button"><span>03</span><strong>Pengeluaran</strong><small>Buka kategori pembelian.</small></button>
          <button onClick={() => scrollToFinanceForm("finance-ar-ap-form")} type="button"><span>04</span><strong>AR / AP</strong><small>Buka kategori pembayaran.</small></button>
          <button onClick={() => scrollToFinanceForm("finance-payment-form")} type="button"><span>05</span><strong>Pembayaran</strong><small>Buka rekonsiliasi pembayaran.</small></button>
          <button onClick={() => scrollToFinanceForm("finance-report-form")} type="button"><span>06</span><strong>Laporan</strong><small>Buka kategori laporan.</small></button>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header compact">
          <div>
            <p>Pengingat Keuangan</p>
            <h2>Jatuh Tempo & Persetujuan</h2>
          </div>
          <div className="admin-actions">
            <button onClick={testFinanceOwnerAlerts} type="button">Tes Notifikasi Owner</button>
            <span className={financeReminders.total ? "admin-badge high" : "admin-badge low"}>{financeReminders.total} aktif</span>
          </div>
        </div>
        <div className="admin-event-list compact">
          {financeReminders.arItems.slice(0, 4).map((item) => (
            <article key={`ar-${item.id}`}>
              <strong>{item.invoice_number || item.buyer_name || "Buyer invoice"}</strong>
              <span>{item.days < 0 ? `Terlambat ${Math.abs(item.days)} hari` : item.days === 0 ? "Jatuh tempo hari ini" : `Jatuh tempo ${item.days} hari lagi`}</span>
              <em>AR | {item.buyer_name || "-"} | {formatMoney(item.amount, item.currency || "IDR")}</em>
            </article>
          ))}
          {financeReminders.apItems.slice(0, 4).map((item) => (
            <article key={`ap-${item.id}`}>
              <strong>{item.invoice_number || item.supplier_name || "Supplier bill"}</strong>
              <span>{item.days < 0 ? `Terlambat ${Math.abs(item.days)} hari` : item.days === 0 ? "Jatuh tempo hari ini" : `Jatuh tempo ${item.days} hari lagi`}</span>
              <em>AP | {item.supplier_name || "-"} | {formatMoney(item.amount, item.currency || "IDR")}</em>
            </article>
          ))}
          {financeReminders.pendingApproval.slice(0, 4).map((item) => (
            <article key={`expense-${item.id}`}>
              <strong>{item.expense_category || "Expense approval"}</strong>
              <span>Menunggu persetujuan</span>
              <em>{item.vendor || "-"} | {formatMoney(item.amount, item.currency || "IDR")}</em>
            </article>
          ))}
          {!financeReminders.total ? <p className="admin-empty">Belum ada invoice terlambat, AP jatuh tempo, atau pengeluaran yang menunggu persetujuan.</p> : null}
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p>Closing Bulanan</p>
            <h2>Kunci Periode Keuangan</h2>
          </div>
          <button onClick={saveFinancePeriodLock} type="button">Kunci Periode</button>
        </div>
        <div className="admin-settings-form compact">
          <label>Label Periode<input value={financeLockDraft.period_label} onChange={(event) => setFinanceLockDraft((current) => ({ ...current, period_label: event.target.value }))} placeholder="2026-06" /></label>
          <label>Dari Tanggal<input type="date" value={financeLockDraft.date_from} onChange={(event) => setFinanceLockDraft((current) => ({ ...current, date_from: event.target.value }))} /></label>
          <label>Sampai Tanggal<input type="date" value={financeLockDraft.date_to} onChange={(event) => setFinanceLockDraft((current) => ({ ...current, date_to: event.target.value }))} /></label>
          <label className="wide">Catatan Closing<textarea value={financeLockDraft.lock_note} onChange={(event) => setFinanceLockDraft((current) => ({ ...current, lock_note: event.target.value }))} placeholder="Contoh: Laporan Juni disetujui CEO/CSO." /></label>
        </div>
        <div className="admin-finance-signals">
          {closingChecklist.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.ok ? "Ready" : "Review"}</strong>
              <small>{item.detail}</small>
            </article>
          ))}
        </div>
        <div className="admin-finance-signals">
          {financePeriodLocks.slice(0, 4).map((item) => (
            <article key={item.id}>
              <span>{item.period_label}</span>
              <strong>{item.status}</strong>
              <small>{item.date_from} to {item.date_to}</small>
              {item.status === "Locked" ? <button className="ghost" onClick={() => reopenFinancePeriodLock(item)} type="button">Buka Lagi</button> : null}
            </article>
          ))}
          {!financePeriodLocks.length ? <article><span>Belum ada periode dikunci</span><strong>Terbuka</strong><small>Gunakan setelah review bulanan selesai.</small></article> : null}
        </div>
      </div>

      <div className="admin-panel wide">
        <div className="admin-panel-header compact">
          <div>
            <p>Arus Kas</p>
            <h2>Kas Masuk / Keluar Bulanan</h2>
          </div>
          <span className={financeMetrics.runway > 0 && financeMetrics.runway <= 2 ? "admin-badge high" : "admin-badge low"}>{cashFlowVisual.warning}</span>
        </div>
        <div className="admin-report-breakdown">
          {cashFlowVisual.rows.map((item) => (
            <p key={item.key}>
              <span>{item.label}</span>
              <strong>{formatMoney(item.net, "IDR")}</strong>
              <small style={{ display: "grid", gap: 4, minWidth: 180 }}>
                <i style={{ background: "rgba(87, 255, 190, 0.32)", borderRadius: 999, height: 7, width: `${Math.max(4, (item.cashIn / cashFlowVisual.maxFlow) * 100)}%` }} />
                <i style={{ background: "rgba(255, 107, 107, 0.34)", borderRadius: 999, height: 7, width: `${Math.max(4, (item.cashOut / cashFlowVisual.maxFlow) * 100)}%` }} />
              </small>
            </p>
          ))}
        </div>
        <div className="admin-finance-signals">
          <article><span>Perkiraan Runway</span><strong>{financeMetrics.runway ? `${financeMetrics.runway} bulan` : "-"}</strong></article>
          <article><span>Burn Rate Saat Ini</span><strong>{formatMoney(financeMetrics.burnRate, "IDR")}</strong></article>
          <article><span>AR Terbuka</span><strong>{formatMoney(financeMetrics.receivableByCurrency.IDR || 0, "IDR")}</strong></article>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header compact"><div><p>Indikator Bisnis</p><h2>Sinyal Perdagangan</h2></div></div>
        <div className="admin-finance-signals">
          <article><span>Buyer Aktif</span><strong>{financeMetrics.activeBuyers}</strong></article>
          <article><span>Pemasok Aktif</span><strong>{financeMetrics.activeSuppliers}</strong></article>
          <article><span>Prospek Aktif</span><strong>{financeMetrics.activeLeads}</strong></article>
          <article><span>Negosiasi Aktif</span><strong>{financeMetrics.activeNegotiations}</strong></article>
          <article><span>Data Pipeline</span><strong>{financeMetrics.pipelineValue}</strong></article>
          <article><span>Negara Terjangkau</span><strong>{financeMetrics.countriesReached}</strong></article>
        </div>
      </div>

      <div className="admin-panel" id="finance-audit-form">
        <div className="admin-panel-header compact"><div><p>Access Management</p><h2>Finance Permissions</h2></div></div>
        <div className="admin-modal-confirm">
          <p>Finance disembunyikan dari user non-eksekutif. Login saat ini memiliki akses finance.</p>
          <strong>Akun CEO dan CSO tidak bisa dihapus, disuspend, atau diturunkan role-nya dari dashboard.</strong>
        </div>
        <div className="admin-event-list">
          {financePermissions.slice(0, 6).map((item) => (
            <article key={item.id}>
              <strong>{item.user_id}</strong>
              <span>{item.permission_key}</span>
              <small>Granted by {item.granted_by || "CEO"}</small>
            </article>
          ))}
          {!financePermissions.length ? <p className="admin-empty">Belum ada permission granular finance. Mode CEO-only aktif.</p> : null}
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p>Kesiapan Storage</p>
            <h2>Dokumen Finance</h2>
          </div>
          <div className="admin-actions">
            <button onClick={checkFinanceStorageStatus} type="button">Cek Storage</button>
            <button onClick={prepareFinanceStorage} type="button">Siapkan Bucket</button>
          </div>
        </div>
        <div className="admin-modal-confirm">
          <p>Bucket: <strong>finance-documents</strong></p>
          <strong>{storageStatus?.message || "Jalankan cek storage sebelum tes upload production."}</strong>
          {storageStatus ? <span className={storageStatus.ready ? "admin-badge low" : "admin-badge high"}>{storageStatus.ready ? "Ready" : "Needs Setup"}</span> : null}
        </div>
      </div>
    </>
  );
}
