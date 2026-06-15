"use client";

export default function FinanceModule({ financeView, showFinanceDetail, children }) {
  return (
    <section className={`admin-finance-grid finance-view-${financeView} ${showFinanceDetail ? "finance-expanded" : "finance-collapsed"}`}>
      {children}
    </section>
  );
}
