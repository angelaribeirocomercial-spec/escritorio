"use server";

import { redirect } from "next/navigation";

import type { FinancialEntryKind } from "@lexia/domain";

import { createFinancialEntry } from "@/server/services/finance/create-financial-entry";

const targetPathByKind: Record<FinancialEntryKind, string> = {
  expense: "/financeiro/despesas",
  income: "/financeiro/receitas",
  transfer: "/financeiro/transferencias"
};

export async function createFinancialEntryAction(formData: FormData) {
  const kind = String(formData.get("kind") ?? "expense") as FinancialEntryKind;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const accountLabel = String(formData.get("accountLabel") ?? "").trim();
  const counterpartyLabel = String(formData.get("counterpartyLabel") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").replace(",", ".").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const status = String(formData.get("status") ?? "open") as "open" | "settled";
  const categoryLabel = String(formData.get("categoryLabel") ?? "").trim();

  if (!title || !accountLabel || !amountRaw || !dueDate || !categoryLabel) {
    redirect(`/financeiro/${kind === "expense" ? "despesas" : kind === "income" ? "receitas" : "transferencias"}/novo`);
  }

  const amount = Number(amountRaw);

  if (Number.isNaN(amount)) {
    redirect(`/financeiro/${kind === "expense" ? "despesas" : kind === "income" ? "receitas" : "transferencias"}/novo`);
  }

  await createFinancialEntry({
    kind,
    title,
    description,
    accountLabel,
    counterpartyLabel,
    amount,
    dueDate,
    status,
    categoryLabel,
    clientId: String(formData.get("clientId") ?? "") || undefined,
    caseId: String(formData.get("caseId") ?? "") || undefined,
    settledAt: status === "settled" ? dueDate : undefined
  });

  redirect(targetPathByKind[kind]);
}
