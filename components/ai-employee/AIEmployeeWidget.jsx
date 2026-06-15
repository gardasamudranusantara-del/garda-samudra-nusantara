"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const roleQuickPrompts = {
  ceo: [
    "Tampilkan prospek baru hari ini",
    "Cek invoice yang belum lunas",
    "Apa reminder penting hari ini?",
    "Ringkas laporan finance bulan ini"
  ],
  cso: [
    "Tampilkan prospek baru hari ini",
    "Cek invoice yang belum lunas",
    "Apa reminder penting hari ini?",
    "Ringkas laporan finance bulan ini"
  ],
  owner: [
    "Tampilkan prospek baru hari ini",
    "Cek invoice yang belum lunas",
    "Apa reminder penting hari ini?",
    "Ringkas laporan finance bulan ini"
  ],
  finance: [
    "Cek invoice yang belum lunas",
    "Ringkas laporan finance bulan ini",
    "Apa approval finance yang menunggu?",
    "Cek pengeluaran bulan ini"
  ],
  marketing: [
    "Tampilkan prospek baru hari ini",
    "Apa prospek yang perlu follow-up?",
    "Cari riwayat buyer",
    "Bantu buat catatan follow-up buyer"
  ],
  procurement: [
    "Apa reminder penting hari ini?",
    "Cari dokumen supplier",
    "Cek quotation yang perlu dipantau",
    "Bantu rangkum kebutuhan sourcing"
  ],
  hr: [
    "Ringkas absensi hari ini",
    "Cek user dashboard aktif",
    "Apa reminder internal hari ini?",
    "Bantu buat catatan HR"
  ],
  staff: [
    "Apa saja yang bisa saya lakukan?",
    "Bantu buat catatan kerja hari ini",
    "Bantu susun follow-up sederhana",
    "Jelaskan cara memakai dashboard"
  ],
  viewer: [
    "Apa saja yang bisa saya lihat?",
    "Jelaskan menu dashboard",
    "Bantu baca ringkasan yang tersedia",
    "Jelaskan cara memakai dashboard"
  ]
};

function normalizeRole(role) {
  return String(role || "staff").toLowerCase();
}

function getQuickPrompts(role, permissions = []) {
  const access = new Set(permissions || []);
  const prompts = [];

  if (access.has("edit_leads")) {
    prompts.push("Tampilkan prospek baru hari ini", "Apa prospek yang perlu follow-up?");
  }
  if (["finance_access", "finance_sales", "finance_reports", "finance_purchase"].some((permission) => access.has(permission))) {
    prompts.push("Cek invoice yang belum lunas", "Ringkas laporan finance bulan ini");
  }
  if (access.has("finance_manage_access")) {
    prompts.push("Apa approval finance yang menunggu?");
  }
  if (access.has("attendance_access")) {
    prompts.push("Ringkas absensi hari ini");
  }
  if (access.has("documents_access")) {
    prompts.push("Cek dokumen penting");
  }
  if (["supplier_access", "crm_suppliers_view", "crm_suppliers_capacity", "crm_suppliers_contacts"].some((permission) => access.has(permission))) {
    prompts.push("Cari ringkasan pemasok");
  }

  if (prompts.length) {
    return [...new Set(prompts)].slice(0, 4);
  }

  return roleQuickPrompts[normalizeRole(role)] || roleQuickPrompts.staff;
}

function getWelcomeMessage(role) {
  const normalizedRole = normalizeRole(role);

  if (["ceo", "cso", "owner"].includes(normalizedRole)) {
    return "Halo, aku AI Employee GSN. Aku bisa bantu cek prospek, invoice, finance, reminder, dan operasional penting.";
  }

  if (normalizedRole === "finance") {
    return "Halo, aku AI Employee GSN. Aku bisa bantu cek invoice, laporan finance, pengeluaran, approval, dan reminder pembayaran.";
  }

  if (normalizedRole === "marketing") {
    return "Halo, aku AI Employee GSN. Aku bisa bantu cek prospek, riwayat buyer, follow-up, dan quotation.";
  }

  if (normalizedRole === "procurement") {
    return "Halo, aku AI Employee GSN. Aku bisa bantu hal umum procurement sesuai aksesmu. Data pemasok tetap dibatasi khusus Dapi dan Pici.";
  }

  if (normalizedRole === "hr") {
    return "Halo, aku AI Employee GSN. Aku bisa bantu ringkasan absensi, user, dan proses internal HR.";
  }

  return "Halo, aku AI Employee GSN. Akses akunmu terbatas, jadi aku akan bantu hal umum dan panduan dashboard yang sesuai role kamu.";
}

export default function AIEmployeeWidget({ userRole, userPermissions = [], authToken, username }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: getWelcomeMessage(userRole)
    }
  ]);
  const [history, setHistory] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const quickPrompts = useMemo(() => getQuickPrompts(userRole, userPermissions), [userRole, userPermissions]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, pendingAction]);

  async function callChat(payload) {
    const response = await fetch("/api/ai-employee/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken ? `Bearer ${authToken}` : "",
        "x-admin-session": authToken || ""
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.reply || data.message || "AI Employee gagal merespons.");
    }
    return data;
  }

  async function sendMessage(message) {
    const value = message.trim();
    if (!value || isLoading || pendingAction) return;

    setMessages((current) => [...current, { role: "user", content: value }]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await callChat({ message: value, history });
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
      setHistory(data.history || []);
      setPendingAction(data.pendingAction || null);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error.message }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function respondToConfirmation(confirmed) {
    if (!pendingAction || isLoading) return;

    setIsLoading(true);
    setMessages((current) => [
      ...current,
      { role: "user", content: confirmed ? "Ya, lanjutkan." : "Batalkan." }
    ]);

    try {
      const data = await callChat({
        history,
        pendingAction: {
          token: pendingAction.token,
          confirmed
        }
      });
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
      setHistory(data.history || []);
      setPendingAction(data.pendingAction || null);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error.message }]);
    } finally {
      setIsLoading(false);
    }
  }

  if (!authToken) {
    return null;
  }

  return (
    <div className={`ai-employee ${isOpen ? "is-open" : ""}`}>
      {!isOpen ? (
        <button className="ai-employee-launcher" onClick={() => setIsOpen(true)} type="button">
          <span>AI</span>
          <strong>Employee</strong>
        </button>
      ) : (
        <section className="ai-employee-panel" aria-label="GSN AI Employee">
          <header className="ai-employee-header">
            <div>
              <p>GSN AI Employee</p>
              <span>{username || "Admin"} / {userRole || "staff"}</span>
            </div>
            <button aria-label="Close AI Employee" onClick={() => setIsOpen(false)} type="button">x</button>
          </header>

          <div className="ai-employee-messages" ref={scrollRef}>
            {messages.map((message, index) => (
              <article className={`ai-message ${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </article>
            ))}
            {isLoading ? <article className="ai-message assistant muted">Sedang membaca data...</article> : null}
            {pendingAction && !isLoading ? (
              <div className="ai-confirmation">
                <p>{pendingAction.summary}</p>
                <div>
                  <button onClick={() => respondToConfirmation(true)} type="button">Konfirmasi</button>
                  <button onClick={() => respondToConfirmation(false)} type="button">Batalkan</button>
                </div>
              </div>
            ) : null}
          </div>

          {!pendingAction ? (
            <div className="ai-quick-prompts">
              {quickPrompts.map((prompt) => (
                <button disabled={isLoading} key={prompt} onClick={() => sendMessage(prompt)} type="button">
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <form className="ai-employee-input" onSubmit={(event) => {
            event.preventDefault();
            sendMessage(input);
          }}>
            <input
              disabled={isLoading || Boolean(pendingAction)}
              onChange={(event) => setInput(event.target.value)}
              placeholder={pendingAction ? "Konfirmasi dulu aksi di atas" : "Tanya AI Employee..."}
              value={input}
            />
            <button disabled={isLoading || Boolean(pendingAction)} type="submit">Kirim</button>
          </form>
        </section>
      )}
    </div>
  );
}
