"use client";

export function BuyersModule({
  filteredBuyerProfiles,
  exportRowsCsv,
  query,
  setQuery,
  listToText,
  labelAssignee,
  openModal,
  openDeleteModal,
  canDelete,
  buyerDraft,
  setBuyerDraft,
  buyerStages,
  relationshipStatuses,
  assignableUsers,
  saveBuyerProfile
}) {
  return (
    <section className="admin-grid">
      <div className="admin-panel admin-table-panel">
        <div className="admin-panel-header">
          <div><p>Database Pembeli</p><h2>Profil Buyer Tetap</h2></div>
          <button disabled={!filteredBuyerProfiles.length} onClick={() => exportRowsCsv(`gsn-buyers-${new Date().toISOString().slice(0, 10)}.csv`, ["Buyer", "Company", "Email", "WhatsApp", "Country", "Products", "Stage", "Relationship", "Owner"], filteredBuyerProfiles.map((item) => [item.buyer_name, item.company_name, item.email, item.whatsapp, item.country, listToText(item.products), item.buyer_stage, item.relationship_status, item.assigned_to]))} type="button">Ekspor CSV</button>
        </div>
        <div className="admin-toolbar">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari buyer, perusahaan, produk, negara..." />
        </div>
        <div className="admin-table-wrap">
          <table className="admin-mobile-cards">
            <thead><tr><th>Buyer</th><th>Country</th><th>Products</th><th>Stage</th><th>Relationship</th><th>Owner</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredBuyerProfiles.map((item) => (
                <tr key={item.id}>
                  <td data-label="Buyer"><strong>{item.company_name || item.buyer_name || "-"}</strong><span>{item.buyer_name || item.email || "-"}</span></td>
                  <td data-label="Country">{item.country || "-"}</td>
                  <td data-label="Products">{listToText(item.products) || "-"}</td>
                  <td data-label="Stage">{item.buyer_stage || "-"}</td>
                  <td data-label="Relationship">{item.relationship_status || "-"}</td>
                  <td data-label="Owner">{labelAssignee(item.assigned_to)}</td>
                  <td data-label="Actions"><div className="admin-table-actions"><button onClick={() => openModal("buyerProfile", item)} type="button">Edit</button>{canDelete ? <button className="danger" onClick={() => openDeleteModal("buyerProfile", item)} type="button">Hapus</button> : null}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredBuyerProfiles.length ? <p className="admin-empty table">Belum ada profil buyer. Tambahkan buyer penting setelah kualifikasi.</p> : null}
        </div>
      </div>
      <aside className="admin-panel admin-detail">
        <div className="admin-panel-header"><div><p>Tambah Pembeli</p><h2>Profil Buyer</h2></div></div>
        <div className="admin-settings-form compact">
          <label>Nama Buyer<input value={buyerDraft.buyer_name} onChange={(event) => setBuyerDraft((current) => ({ ...current, buyer_name: event.target.value }))} /></label>
          <label>Perusahaan<input value={buyerDraft.company_name} onChange={(event) => setBuyerDraft((current) => ({ ...current, company_name: event.target.value }))} /></label>
          <label>Email<input value={buyerDraft.email} onChange={(event) => setBuyerDraft((current) => ({ ...current, email: event.target.value }))} /></label>
          <label>WhatsApp<input value={buyerDraft.whatsapp} onChange={(event) => setBuyerDraft((current) => ({ ...current, whatsapp: event.target.value }))} /></label>
          <label>Negara<input value={buyerDraft.country} onChange={(event) => setBuyerDraft((current) => ({ ...current, country: event.target.value }))} /></label>
          <label>Produk<input value={buyerDraft.products} onChange={(event) => setBuyerDraft((current) => ({ ...current, products: event.target.value }))} placeholder="Coconut charcoal, spices..." /></label>
          <label>Stage<select value={buyerDraft.buyer_stage} onChange={(event) => setBuyerDraft((current) => ({ ...current, buyer_stage: event.target.value }))}>{buyerStages.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
          <label>Relationship<select value={buyerDraft.relationship_status} onChange={(event) => setBuyerDraft((current) => ({ ...current, relationship_status: event.target.value }))}>{relationshipStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label>Ditugaskan Ke<select value={buyerDraft.assigned_to} onChange={(event) => setBuyerDraft((current) => ({ ...current, assigned_to: event.target.value }))}><option value="">Belum ditugaskan</option>{assignableUsers.map((user) => <option key={user}>{user}</option>)}</select></label>
          <label>Catatan<textarea value={buyerDraft.notes} onChange={(event) => setBuyerDraft((current) => ({ ...current, notes: event.target.value }))} /></label>
          <button onClick={saveBuyerProfile} type="button">Simpan Buyer</button>
        </div>
      </aside>
    </section>
  );
}

export function SuppliersModule({
  filteredSuppliers,
  exportRowsCsv,
  query,
  setQuery,
  listToText,
  openModal,
  openDeleteModal,
  canDelete,
  supplierDraft,
  setSupplierDraft,
  supplierPermissions = {},
  supplierStatuses,
  saveSupplier
}) {
  const canSeeContacts = Boolean(supplierPermissions.contacts);
  const canSeeCapacity = Boolean(supplierPermissions.capacity);
  const canSeeCommercial = Boolean(supplierPermissions.commercial);
  const canManageSupplier = Boolean(supplierPermissions.manage);
  const canExportSupplier = Boolean(supplierPermissions.export);
  const hiddenText = "Tersembunyi";

  return (
    <section className="admin-grid">
      <div className="admin-panel admin-table-panel">
        <div className="admin-panel-header">
          <div><p>Database Pemasok</p><h2>Jaringan Sourcing</h2></div>
          {canExportSupplier ? (
            <button disabled={!filteredSuppliers.length} onClick={() => exportRowsCsv(`gsn-suppliers-${new Date().toISOString().slice(0, 10)}.csv`, ["Supplier", "Company", "Contact", "Country", "Products", "Capacity", "Payment Terms", "Status"], filteredSuppliers.map((item) => [item.supplier_name, item.company_name, canSeeContacts ? item.contact_person : hiddenText, item.country, canSeeCapacity ? listToText(item.products) : hiddenText, canSeeCapacity ? item.capacity : hiddenText, canSeeCommercial ? item.payment_terms : hiddenText, item.status]))} type="button">Ekspor CSV</button>
          ) : null}
        </div>
        <div className="admin-toolbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari pemasok, produk, kategori, kota..." /></div>
        <div className="admin-table-wrap">
          <table className="admin-mobile-cards">
            <thead><tr><th>Supplier</th><th>Location</th><th>Products</th><th>Capacity</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredSuppliers.map((item) => (
                <tr key={item.id}>
                  <td data-label="Supplier"><strong>{item.company_name || item.supplier_name || "-"}</strong><span>{canSeeContacts ? (item.contact_person || item.email || "-") : hiddenText}</span></td>
                  <td data-label="Location">{[item.city, item.country].filter(Boolean).join(", ") || "-"}</td>
                  <td data-label="Products">{canSeeCapacity ? (listToText(item.products) || listToText(item.product_categories) || "-") : hiddenText}</td>
                  <td data-label="Capacity">{canSeeCapacity ? (item.capacity || "-") : hiddenText}</td>
                  <td data-label="Rating">{canSeeCapacity ? (item.quality_rating ? `${item.quality_rating}/5` : "-") : hiddenText}</td>
                  <td data-label="Status">{item.status || "-"}</td>
                  <td data-label="Actions"><div className="admin-table-actions">{canManageSupplier ? <button onClick={() => openModal("supplier", item)} type="button">Edit</button> : null}{canDelete && canManageSupplier ? <button className="danger" onClick={() => openDeleteModal("supplier", item)} type="button">Hapus</button> : null}{!canManageSupplier ? <span>{hiddenText}</span> : null}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredSuppliers.length ? <p className="admin-empty table">Belum ada pemasok tersimpan. Simpan kontak sourcing, kapasitas, termin pembayaran, dan catatan kualitas di sini.</p> : null}
        </div>
      </div>
      {canManageSupplier ? <aside className="admin-panel admin-detail">
        <div className="admin-panel-header"><div><p>Tambah Pemasok</p><h2>Profil Supplier</h2></div></div>
        <div className="admin-settings-form compact">
          <label>Nama Supplier<input value={supplierDraft.supplier_name} onChange={(event) => setSupplierDraft((current) => ({ ...current, supplier_name: event.target.value }))} /></label>
          <label>Perusahaan<input value={supplierDraft.company_name} onChange={(event) => setSupplierDraft((current) => ({ ...current, company_name: event.target.value }))} /></label>
          <label>Kontak Person<input value={supplierDraft.contact_person} onChange={(event) => setSupplierDraft((current) => ({ ...current, contact_person: event.target.value }))} /></label>
          <label>WhatsApp<input value={supplierDraft.whatsapp} onChange={(event) => setSupplierDraft((current) => ({ ...current, whatsapp: event.target.value }))} /></label>
          <label>Kota<input value={supplierDraft.city} onChange={(event) => setSupplierDraft((current) => ({ ...current, city: event.target.value }))} /></label>
          <label>Kategori<input value={supplierDraft.product_categories} onChange={(event) => setSupplierDraft((current) => ({ ...current, product_categories: event.target.value }))} placeholder="Spices, charcoal..." /></label>
          <label>Produk<input value={supplierDraft.products} onChange={(event) => setSupplierDraft((current) => ({ ...current, products: event.target.value }))} /></label>
          <label>Kapasitas<input value={supplierDraft.capacity} onChange={(event) => setSupplierDraft((current) => ({ ...current, capacity: event.target.value }))} placeholder="10 MT/month" /></label>
          <label>Status<select value={supplierDraft.status} onChange={(event) => setSupplierDraft((current) => ({ ...current, status: event.target.value }))}>{supplierStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label>Catatan<textarea value={supplierDraft.notes} onChange={(event) => setSupplierDraft((current) => ({ ...current, notes: event.target.value }))} /></label>
          <button onClick={saveSupplier} type="button">Simpan Supplier</button>
        </div>
      </aside> : (
        <aside className="admin-panel admin-detail">
          <div className="admin-panel-header"><div><p>Akses Pemasok</p><h2>Mode Lihat</h2></div></div>
          <p className="admin-empty">Akun ini hanya dapat melihat bagian pemasok yang dipilih oleh owner. Tambah, edit, export, kontak, kapasitas, dan data komersial mengikuti sub-permission masing-masing.</p>
        </aside>
      )}
    </section>
  );
}

export function DocumentsModule({
  filteredBusinessDocuments,
  exportRowsCsv,
  query,
  setQuery,
  formatDate,
  openModal,
  openDeleteModal,
  canDelete,
  documentDraft,
  setDocumentDraft,
  documentTypes,
  documentStatuses,
  saveBusinessDocument
}) {
  return (
    <section className="admin-grid">
      <div className="admin-panel admin-table-panel">
        <div className="admin-panel-header">
          <div><p>Manajemen Dokumen</p><h2>Kontrak, Sertifikat, dan File Dagang</h2></div>
          <button disabled={!filteredBusinessDocuments.length} onClick={() => exportRowsCsv(`gsn-documents-${new Date().toISOString().slice(0, 10)}.csv`, ["Type", "Title", "Related", "Status", "Expiry", "Owner", "URL"], filteredBusinessDocuments.map((item) => [item.document_type, item.title, `${item.related_type || ""} ${item.related_name || ""}`.trim(), item.status, item.expiry_date, item.owner, item.file_url]))} type="button">Ekspor CSV</button>
        </div>
        <div className="admin-toolbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari dokumen, buyer, supplier, owner..." /></div>
        <div className="admin-table-wrap">
          <table className="admin-mobile-cards">
            <thead><tr><th>Document</th><th>Related</th><th>Status</th><th>Expiry</th><th>Owner</th><th>File</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredBusinessDocuments.map((item) => (
                <tr key={item.id}>
                  <td data-label="Document"><strong>{item.title || "-"}</strong><span>{item.document_type || "-"}</span></td>
                  <td data-label="Related">{[item.related_type, item.related_name].filter(Boolean).join(": ") || "-"}</td>
                  <td data-label="Status">{item.status || "-"}</td>
                  <td data-label="Expiry">{item.expiry_date ? formatDate(item.expiry_date) : "-"}</td>
                  <td data-label="Owner">{item.owner || item.created_by || "-"}</td>
                  <td data-label="File">{item.file_url ? <a href={item.file_url} target="_blank" rel="noreferrer">Buka</a> : "-"}</td>
                  <td data-label="Actions"><div className="admin-table-actions"><button onClick={() => openModal("businessDocument", item)} type="button">Edit</button>{canDelete ? <button className="danger" onClick={() => openDeleteModal("businessDocument", item)} type="button">Hapus</button> : null}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredBusinessDocuments.length ? <p className="admin-empty table">Belum ada dokumen tersimpan. Simpan kontrak, sertifikat ekspor, bukti pembayaran, dan dokumen legal di sini.</p> : null}
        </div>
      </div>
      <aside className="admin-panel admin-detail">
        <div className="admin-panel-header"><div><p>Tambah Dokumen</p><h2>File Bisnis</h2></div></div>
        <div className="admin-settings-form compact">
          <label>Tipe<select value={documentDraft.document_type} onChange={(event) => setDocumentDraft((current) => ({ ...current, document_type: event.target.value }))}>{documentTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label>Judul<input value={documentDraft.title} onChange={(event) => setDocumentDraft((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>Tipe Relasi<input value={documentDraft.related_type} onChange={(event) => setDocumentDraft((current) => ({ ...current, related_type: event.target.value }))} placeholder="Buyer / Supplier / Finance" /></label>
          <label>Nama Relasi<input value={documentDraft.related_name} onChange={(event) => setDocumentDraft((current) => ({ ...current, related_name: event.target.value }))} /></label>
          <label>URL File<input value={documentDraft.file_url} onChange={(event) => setDocumentDraft((current) => ({ ...current, file_url: event.target.value }))} placeholder="Google Drive, Supabase, or signed URL" /></label>
          <label>Status<select value={documentDraft.status} onChange={(event) => setDocumentDraft((current) => ({ ...current, status: event.target.value }))}>{documentStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label>Tanggal Kedaluwarsa<input type="date" value={documentDraft.expiry_date} onChange={(event) => setDocumentDraft((current) => ({ ...current, expiry_date: event.target.value }))} /></label>
          <label>Owner<input value={documentDraft.owner} onChange={(event) => setDocumentDraft((current) => ({ ...current, owner: event.target.value }))} /></label>
          <label>Catatan<textarea value={documentDraft.notes} onChange={(event) => setDocumentDraft((current) => ({ ...current, notes: event.target.value }))} /></label>
          <button onClick={saveBusinessDocument} type="button">Simpan Dokumen</button>
        </div>
      </aside>
    </section>
  );
}
