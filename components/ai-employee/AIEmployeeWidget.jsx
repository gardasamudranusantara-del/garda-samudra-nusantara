"use client";

import { useEffect, useRef, useState } from "react";

export default function AIEmployeeWidget({ userRole, authToken, username }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Halo, aku AI Employee GSN. Aku bisa bantu cek prospek, invoice, pengeluaran, dan mencatat data setelah kamu konfirmasi."
    }
  ]);
  const [history, setHistory] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

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
          toolCall: pendingAction.toolCall,
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
              <span>{username || "Admin"} · {userRole || "staff"}</span>
            </div>
            <button aria-label="Close AI Employee" onClick={() => setIsOpen(false)} type="button">×</button>
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
