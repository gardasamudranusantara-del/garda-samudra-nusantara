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
  saveUserAccount,
  language = "id"
}) {
  const text = language === "en" ? {
    userManagement: "User Management",
    adminAccounts: "Admin Accounts",
    refreshUsers: "Refresh Users",
    inactive: "inactive",
    active: "active",
    customAccess: "Custom dashboard access.",
    activate: "Activate",
    deactivate: "Deactivate",
    delete: "Delete",
    envAccount: "Environment account. Edit this account in Vercel env if needed.",
    createAccount: "Create Account",
    dashboardUser: "Dashboard User",
    passwordPlaceholder: "minimum 6 characters",
    role: "Role",
    visibleAccess: "Visible access",
    saveUser: "Save User",
    recommended: "Recommended staff roles:",
    recommendationList: "Finance, Procurement, Marketing, HR, Staff, Viewer",
    recommendationNote: "Use CEO/CSO only for owner accounts. Finance module is only for CEO, CSO, and Finance."
  } : {
    userManagement: "Manajemen Pengguna",
    adminAccounts: "Akun Admin",
    refreshUsers: "Muat Ulang Pengguna",
    inactive: "nonaktif",
    active: "aktif",
    customAccess: "Akses dashboard khusus.",
    activate: "Aktifkan",
    deactivate: "Nonaktifkan",
    delete: "Hapus",
    envAccount: "Akun environment. Ubah akun ini melalui env Vercel jika diperlukan.",
    createAccount: "Buat Akun",
    dashboardUser: "Pengguna Dashboard",
    passwordPlaceholder: "minimal 6 karakter",
    role: "Role",
    visibleAccess: "Akses yang ditampilkan",
    saveUser: "Simpan User",
    recommended: "Role staff yang disarankan:",
    recommendationList: "Finance, Procurement, Marketing, HR, Staff, Viewer",
    recommendationNote: "Gunakan CEO/CSO hanya untuk akun owner. Modul finance hanya untuk CEO, CSO, dan Finance."
  };

  function permissionValues(permission) {
    return permission.children?.length ? permission.children.map((child) => child.value) : [permission.value];
  }

  function toggleDraftPermission(permission) {
    const values = permissionValues(permission);
    setUserDraft((current) => {
      const permissions = new Set(current.permissions || []);
      const shouldRemove = values.every((value) => permissions.has(value));
      values.forEach((value) => {
        if (value === "view") {
          permissions.add(value);
        } else if (shouldRemove) {
          permissions.delete(value);
        } else {
          permissions.add(value);
        }
      });

      return { ...current, permissions: ["view", ...Array.from(permissions).filter((item) => item !== "view")] };
    });
  }

  function toggleAccountPermission(account, permission) {
    const values = permissionValues(permission);
    const permissions = new Set(account.permissions || []);
    const shouldRemove = values.every((value) => permissions.has(value));
    values.forEach((value) => {
      if (value === "view") {
        permissions.add(value);
      } else if (shouldRemove) {
        permissions.delete(value);
      } else {
        permissions.add(value);
      }
    });

    updateUserAccount(account, { permissions: ["view", ...Array.from(permissions).filter((item) => item !== "view")] });
  }

  function isPermissionChecked(permissions, permission) {
    const values = permissionValues(permission);
    return values.every((value) => (permissions || []).includes(value));
  }

  function renderPermissionEditor(permissions, onToggle, keyPrefix = "permission") {
    return (
      <div className="admin-permission-grid nested">
        {accessOptions.map((permission) => (
          <div key={`${keyPrefix}-${permission.value}`} className="admin-permission-group">
            <label className="admin-permission-check group">
              <input
                checked={isPermissionChecked(permissions, permission)}
                onChange={() => onToggle(permission)}
                type="checkbox"
              />
              <span>
                <strong>{permission.label}</strong>
                <small>{permission.description}</small>
              </span>
            </label>
            {permission.children?.length ? (
              <div className="admin-permission-subgrid">
                {permission.children.map((child) => (
                  <label key={`${keyPrefix}-${permission.value}-${child.value}`} className="admin-permission-check sub">
                    <input
                      checked={(permissions || []).includes(child.value)}
                      onChange={() => onToggle(child)}
                      type="checkbox"
                    />
                    <span>
                      <strong>{child.label}</strong>
                      <small>{child.description}</small>
                    </span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="admin-settings-grid">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p>{text.userManagement}</p>
            <h2>{text.adminAccounts}</h2>
          </div>
          <button onClick={() => loadUsers(savedCredentials)} type="button">{text.refreshUsers}</button>
        </div>
        <div className="admin-user-list">
          {userAccounts.map((account) => (
            <article key={account.username}>
              <div>
                <strong>{account.username}</strong>
                <span>{adminRoleLabels[account.role] || account.role} | {account.source || "dashboard"} | {account.is_active === false ? text.inactive : text.active}</span>
              </div>
              <small>{adminRoleDescriptions[account.role] || text.customAccess}</small>
              {account.source !== "env" ? (
                <div className="admin-user-actions">
                  <select value={account.role} onChange={(event) => updateUserAccount(account, { role: event.target.value, permissions: defaultPermissionsByRole[event.target.value] || ["view"] })}>
                    {adminRoleOptions.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                  <button onClick={() => updateUserAccount(account, { is_active: account.is_active === false })} type="button">
                    {account.is_active === false ? text.activate : text.deactivate}
                  </button>
                  <button className="danger" onClick={() => deleteUserAccount(account)} type="button">{text.delete}</button>
                  {renderPermissionEditor(account.permissions || [], (permission) => toggleAccountPermission(account, permission), account.username)}
                </div>
              ) : (
                <small>{text.envAccount}</small>
              )}
            </article>
          ))}
        </div>
      </div>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p>{text.createAccount}</p>
            <h2>{text.dashboardUser}</h2>
          </div>
        </div>
        <div className="admin-settings-form">
          <label>Username<input value={userDraft.username} onChange={(event) => setUserDraft((current) => ({ ...current, username: event.target.value }))} placeholder="marketing" /></label>
          <label>Password<input value={userDraft.password} onChange={(event) => setUserDraft((current) => ({ ...current, password: event.target.value }))} placeholder={text.passwordPlaceholder} type="password" /></label>
          <label>{text.role}
            <select value={userDraft.role} onChange={(event) => setUserDraft((current) => ({ ...current, role: event.target.value, permissions: defaultPermissionsByRole[event.target.value] || ["view"] }))}>
              {adminRoleOptions.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </label>
          <div className="admin-permission-editor">
            <p>{text.visibleAccess}</p>
            {renderPermissionEditor(userDraft.permissions || [], toggleDraftPermission, "draft")}
          </div>
          <button onClick={saveUserAccount} type="button">{text.saveUser}</button>
        </div>
        <div className="admin-modal-confirm">
          <p>{text.recommended}</p>
          <strong>{text.recommendationList}</strong>
          <p>{text.recommendationNote}</p>
        </div>
      </div>
    </section>
  );
}
