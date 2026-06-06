import { requireAdminPermission } from "@/lib/adminAuth";
import { insertAdminActivity, insertFinanceBudget } from "@/lib/gsnDataStore";

const budgetCategories = ["Operations", "Marketing", "Technology", "Human Resources", "Logistics", "Business Development", "Legal"];

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const plannedBudget = Number(data.planned_budget || 0);
  const actualSpending = Number(data.actual_spending || 0);
  const fiscalYear = Number(data.fiscal_year || new Date().getFullYear());

  if (!Number.isInteger(fiscalYear) || fiscalYear < 2024 || fiscalYear > 2100) {
    return Response.json({ message: "Fiscal year is invalid." }, { status: 400 });
  }

  if (!budgetCategories.includes(data.budget_category)) {
    return Response.json({ message: "Budget category is invalid." }, { status: 400 });
  }

  if (!Number.isFinite(plannedBudget) || plannedBudget < 0 || !Number.isFinite(actualSpending) || actualSpending < 0) {
    return Response.json({ message: "Budget values must be valid positive numbers." }, { status: 400 });
  }

  const remainingBudget = plannedBudget - actualSpending;
  const result = await insertFinanceBudget({
    fiscal_year: fiscalYear,
    budget_category: data.budget_category,
    planned_budget: plannedBudget,
    actual_spending: actualSpending,
    remaining_budget: remainingBudget,
    currency: ["IDR", "USD", "SGD"].includes(data.currency) ? data.currency : "IDR"
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "create_finance_budget",
    label: `Created ${fiscalYear} ${data.budget_category} budget`,
    referenceType: "finance_budget",
    referenceId: result?.[0]?.id || null,
    metadata: {
      after: {
        fiscal_year: fiscalYear,
        budget_category: data.budget_category,
        planned_budget: plannedBudget,
        actual_spending: actualSpending,
        remaining_budget: remainingBudget,
        currency: data.currency || "IDR"
      }
    }
  });

  return Response.json({ ok: true, result });
}
