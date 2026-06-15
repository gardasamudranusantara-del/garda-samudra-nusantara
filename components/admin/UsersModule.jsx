"use client";

export default function UsersModule({
  userAccounts,
  loadUsers,
  savedCredentials,
  adminRoleLabels,
  adminRoleDescriptions,
  adminRoleOptions,
  updateUserAccount,
  deleteUserAccount,
  userDraft,
  setUserDraft,
  saveUserAccount
}) {
  return (
    <section className="admin-settings-grid">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p>Manajemen Pengguna</p>
            <h2>Akun Admin</h2>
          </div>
          <button onClick={() => loadUsers(savedCredentials)} type="button">Muat Ulang Pengguna</button>
        </div>
        <div className="admin-user-list">
          {userAccounts.map((account) => (
            <article key={account.username}>
              <div>
                <strong>{account.username}</strong>
                <span>{adminRoleLabels[account.role] || account.role} | {account.source || "dashboard"} | {account.is_active === false ? "nonaktif" : "aktif"}</span>
              </div>
              <small>{adminRoleDescriptions[account.role] || "Akses dashboard khusus."}</small>
              {account.source !== "env" ? (
                <div className="admin-user-actions">
                  <select value={account.role} onChange={(event) => updateUserAccount(account, { role: event.target.value })}>
                    {adminRoleOptions.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                  <button onClick={() => updateUserAccount(account, { is_active: account.is_active === false })} type="button">
                    {account.is_active === false ? "Aktifkan" : "Nonaktifkan"}
                  </button>
                  <button className="danger" onClick={() => deleteUserAccount(account)} type="button">Hapus</button>
                </div>
              ) : (
                <small>Akun environment. Ubah akun ini melalui env Vercel jika diperlukan.</small>
              )}
            </article>
          ))}
        </div>
      </div>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p>Buat Akun</p>
            <h2>Pengguna Dashboard</h2>
          </div>
        </div>
        <div className="admin-settings-form">
          <label>Username<input value={userDraft.username} onChange={(event) => setUserDraft((current) => ({ ...current, username: event.target.value }))} placeholder="marketing" /></label>
          <label>Password<input value={userDraft.password} onChange={(event) => setUserDraft((current) => ({ ...current, password: event.target.value }))} placeholder="minimal 6 karakter" type="password" /></label>
          <label>Role
            <select value={userDraft.role} onChange={(event) => setUserDraft((current) => ({ ...current, role: event.target.value }))}>
              {adminRoleOptions.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </label>
          <button onClick={saveUserAccount} type="button">Simpan User</button>
        </div>
        <div className="admin-modal-confirm">
          <p>Role staff yang disarankan:</p>
          <strong>Finance, Procurement, Marketing, HR, Staff, Viewer</strong>
          <p>Gunakan CEO/CSO hanya untuk akun owner. Modul finance hanya untuk CEO, CSO, dan Finance.</p>
        </div>
      </div>
    </section>
  );
}
