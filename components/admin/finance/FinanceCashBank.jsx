"use client";

export default function FinanceCashBank({
  financeDraft,
  setFinanceDraft,
  cashInCategories,
  cashOutCategories,
  financeCurrencies,
  paymentMethods,
  saveFinanceTransaction,
  bankAccountDraft,
  setBankAccountDraft,
  bankAccountStatuses,
  saveBankAccount,
  pettyCashDraft,
  setPettyCashDraft,
  pettyCashStatuses,
  savePettyCash
}) {
  return (
    <>
      <div className="admin-panel wide" id="finance-cash-form">
        <div className="admin-panel-header">
          <div>
            <p>Manajemen Kas</p>
            <h2>Kas Masuk / Kas Keluar</h2>
          </div>
          <button onClick={saveFinanceTransaction} type="button">Simpan Transaksi</button>
        </div>
        <div className="admin-settings-form finance-form">
          <label>Tipe
            <select
              value={financeDraft.transaction_type}
              onChange={(event) => setFinanceDraft((current) => ({
                ...current,
                transaction_type: event.target.value,
                category: event.target.value === "Cash Out" ? cashOutCategories[0] : cashInCategories[0]
              }))}
            >
              <option>Cash In</option>
              <option>Cash Out</option>
            </select>
          </label>
          <label>Tanggal<input type="date" value={financeDraft.transaction_date} onChange={(event) => setFinanceDraft((current) => ({ ...current, transaction_date: event.target.value }))} /></label>
          <label>Kategori
            <select value={financeDraft.category} onChange={(event) => setFinanceDraft((current) => ({ ...current, category: event.target.value }))}>
              {(financeDraft.transaction_type === "Cash Out" ? cashOutCategories : cashInCategories).map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label>Nominal<input inputMode="decimal" value={financeDraft.amount} onChange={(event) => setFinanceDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="0" /></label>
          <label>Mata Uang
            <select value={financeDraft.currency} onChange={(event) => setFinanceDraft((current) => ({ ...current, currency: event.target.value }))}>
              {financeCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
            </select>
          </label>
          <label>Metode Pembayaran
            <select value={financeDraft.payment_method} onChange={(event) => setFinanceDraft((current) => ({ ...current, payment_method: event.target.value }))}>
              {paymentMethods.map((method) => <option key={method}>{method}</option>)}
            </select>
          </label>
          <label>Nomor Referensi<input value={financeDraft.reference_number} onChange={(event) => setFinanceDraft((current) => ({ ...current, reference_number: event.target.value }))} placeholder="Nomor invoice, transfer, atau bukti" /></label>
          <label className="wide">Deskripsi<textarea value={financeDraft.description} onChange={(event) => setFinanceDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Deskripsi transaksi, sumber dana, atau catatan operasional" /></label>
        </div>
      </div>

      <div className="admin-panel" id="finance-bank-form">
        <div className="admin-panel-header">
          <div>
            <p>Rekening Bank</p>
            <h2>Saldo Perusahaan</h2>
          </div>
          <button onClick={saveBankAccount} type="button">Simpan Bank</button>
        </div>
        <div className="admin-settings-form compact">
          <label>Nama Rekening<input value={bankAccountDraft.account_name} onChange={(event) => setBankAccountDraft((current) => ({ ...current, account_name: event.target.value }))} placeholder="Rekening Operasional GSN" /></label>
          <label>Nama Bank<input value={bankAccountDraft.bank_name} onChange={(event) => setBankAccountDraft((current) => ({ ...current, bank_name: event.target.value }))} placeholder="Nama bank" /></label>
          <label>Nomor Rekening<input value={bankAccountDraft.account_number} onChange={(event) => setBankAccountDraft((current) => ({ ...current, account_number: event.target.value }))} placeholder="Opsional" /></label>
          <label>Saldo<input inputMode="decimal" value={bankAccountDraft.current_balance} onChange={(event) => setBankAccountDraft((current) => ({ ...current, current_balance: event.target.value }))} placeholder="0" /></label>
          <label>Mata Uang
            <select value={bankAccountDraft.currency} onChange={(event) => setBankAccountDraft((current) => ({ ...current, currency: event.target.value }))}>
              {financeCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
            </select>
          </label>
          <label>Status
            <select value={bankAccountDraft.status} onChange={(event) => setBankAccountDraft((current) => ({ ...current, status: event.target.value }))}>
              {bankAccountStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p>Petty Cash</p>
            <h2>Reimburse & Cash Opname</h2>
          </div>
          <button onClick={savePettyCash} type="button">Simpan Petty Cash</button>
        </div>
        <div className="admin-settings-form compact">
          <label>Tanggal<input type="date" value={pettyCashDraft.cash_date} onChange={(event) => setPettyCashDraft((current) => ({ ...current, cash_date: event.target.value }))} /></label>
          <label>Nominal<input inputMode="decimal" value={pettyCashDraft.amount} onChange={(event) => setPettyCashDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="0" /></label>
          <label>Mata Uang
            <select value={pettyCashDraft.currency} onChange={(event) => setPettyCashDraft((current) => ({ ...current, currency: event.target.value }))}>
              {financeCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
            </select>
          </label>
          <label>Penanggung Jawab<input value={pettyCashDraft.responsible_person} onChange={(event) => setPettyCashDraft((current) => ({ ...current, responsible_person: event.target.value }))} placeholder="Dapi / Pici / staff" /></label>
          <label>Status
            <select value={pettyCashDraft.status} onChange={(event) => setPettyCashDraft((current) => ({ ...current, status: event.target.value }))}>
              {pettyCashStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label className="wide">Deskripsi<textarea value={pettyCashDraft.description} onChange={(event) => setPettyCashDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Kebutuhan kas, reimburse, atau hasil cash opname" /></label>
        </div>
      </div>
    </>
  );
}
