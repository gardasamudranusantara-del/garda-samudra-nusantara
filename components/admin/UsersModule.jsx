"use client";

export default function UsersModule({
  userAccounts,
  loadUsers,
  savedCredentials,
  adminRoleLabels,
  adminRoleDescriptions,
  adminRoleOptions,
  accessOptions,
  defaultPermissionsByRole,
  updateUserAccount,
  deleteUserAccount,
  userDraft,
  setUserDraft,
  saveUserAccount
}) {
  function toggleDraftPermission(permission) {
    setUserDraft((current) => {
      const permissions = new Set(current.permissions || []);
      if (permissions.has(permission)) {
        permissions.delete(permission);
      } else {
        permissions.add(permission);
      }

      return { ...current, permissions: ["view", ...Array.from(permissions).filter((item) => item !== "view")] };
    });
  }

  function toggleAccountPermission(account, permission) {
    const permissions = new Set(account.permissions || []);
    if (permissions.has(permission)) {
      permissions.delete(permission);
    } else {
      permissions.add(permission);
    }

    updateUserAccount(account, { permissions: ["view", ...Array.from(permissions).filter((item) => item !== "view")] });
  }

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
                  <select value={account.role} onChange={(event) => updateUserAccount(account, { role: event.target.value, permissions: defaultPermissionsByRole[event.target.value] || ["view"] })}>
                    {adminRoleOptions.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                  <button onClick={() => updateUserAccount(account, { is_active: account.is_active === false })} type="button">
                    {account.is_active === false ? "Aktifkan" : "Nonaktifkan"}
                  </button>
                  <button className="danger" onClick={() => deleteUserAccount(account)} type="button">Hapus</button>
                  <div className="admin-permission-grid">
                    {accessOptions.map((permission) => (
                      <label key={`${account.username}-${permission.value}`} className="admin-permission-check">
                        <input
                          checked={(account.permissions || []).includes(permission.value)}
                          onChange={() => toggleAccountPermission(account, permission.value)}
                          type="checkbox"
                        />
                        <span>
                          <strong>{permission.label}</strong>
                          <small>{permission.description}</small>
                        </span>
                      </label>
                    ))}
                  </div>
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
            <select value={userDraft.role} onChange={(event) => setUserDraft((current) => ({ ...current, role: event.target.value, permissions: defaultPermissionsByRole[event.target.value] || ["view"] }))}>
              {adminRoleOptions.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </label>
          <div className="admin-permission-editor">
            <p>Akses yang ditampilkan</p>
            <div className="admin-permission-grid">
              {accessOptions.map((permission) => (
                <label key={permission.value} className="admin-permission-check">
                  <input
                    checked={(userDraft.permissions || []).includes(permission.value)}
                    onChange={() => toggleDraftPermission(permission.value)}
                    type="checkbox"
                  />
                  <span>
                    <strong>{permission.label}</strong>
                    <small>{permission.description}</small>
                  </span>
                </label>
              ))}
            </div>
          </div>
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
