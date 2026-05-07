"use server";

import { redirect } from "next/navigation";

import type { FinancialEntryKind } from "@lexia/domain";

import { createFinancialEntry } from "@/server/services/finance/create-financial-entry";

const targetPathByKind: Record<FinancialEntryKind, string> = {
  expense: "/financeiro/despesas",
  income: "/financeiro/receitas",
  transfer: "/financeiro/transferencias"
};

type FinancialEntryFieldName =
  | "title"
  | "accountLabel"
  | "amount"
  | "dueDate"
  | "categoryLabel";

function getCreationPath(kind: FinancialEntryKind) {
  return `${targetPathByKind[kind]}/novo`;
}

function buildRedirectUrl(kind: FinancialEntryKind, formData: FormData, error?: string) {
  const params = new URLSearchParams();

  for (const key of [
    "clientId",
    "caseId",
    "title",
    "description",
    "accountLabel",
    "counterpartyLabel",
    "amount",
    "dueDate",
    "status",
    "categoryLabel"
  ]) {
    const value = formData.get(key);

    if (typeof value === "string" && value.trim()) {
      params.set(key, value.trim());
    }
  }

  if (error) {
    params.set("error", error);
  }

  const query = params.toString();

  return query ? `${getCreationPath(kind)}?${query}` : getCreationPath(kind);
}

function buildMissingFieldError(field: FinancialEntryFieldName) {
  switch (field) {
    case "title":
      return "Campo obrigatorio: informe o titulo do lancamento.";
    case "accountLabel":
      return "Campo obrigatorio: informe a conta operacional do lancamento.";
    case "amount":
      return "Campo obrigatorio: informe o valor do lancamento.";
    case "dueDate":
      return "Campo obrigatorio: informe a data do lancamento.";
    case "categoryLabel":
      return "Campo obrigatorio: informe a categoria do lancamento.";
    default:
      return "Campo obrigatorio nao informado.";
  }
}

function parseAmountInput(rawValue: string) {
  const sanitizedValue = rawValue.replace(/\s+/g, "");

  if (!sanitizedValue || !/^[\d.,]+$/.test(sanitizedValue)) {
    return null;
  }

  const normalizedValue = sanitizedValue.includes(",")
    ? sanitizedValue.replace(/\./g, "").replace(",", ".")
    : sanitizedValue;
  const amount = Number(normalizedValue);

  return Number.isFinite(amount) ? amount : null;
}

function parseOperationalDate(rawValue: string) {
  const normalizedValue = rawValue.trim();

  if (!normalizedValue) {
    return null;
  }

  const isoMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const isoDate = `${year}-${month}-${day}`;
    const parsedDate = new Date(`${isoDate}T00:00:00Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.getUTCFullYear() !== Number(year) ||
      parsedDate.getUTCMonth() + 1 !== Number(month) ||
      parsedDate.getUTCDate() !== Number(day)
    ) {
      return null;
    }

    return isoDate;
  }

  const localMatch = normalizedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!localMatch) {
    return null;
  }

  const [, day, month, year] = localMatch;
  const isoDate = `${year}-${month}-${day}`;
  const parsedDate = new Date(`${isoDate}T00:00:00Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getUTCFullYear() !== Number(year) ||
    parsedDate.getUTCMonth() + 1 !== Number(month) ||
    parsedDate.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return isoDate;
}

export async function createFinancialEntryAction(formData: FormData) {
  const kind = String(formData.get("kind") ?? "expense") as FinancialEntryKind;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const accountLabel = String(formData.get("accountLabel") ?? "").trim();
  const counterpartyLabel = String(formData.get("counterpartyLabel") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const status = String(formData.get("status") ?? "open") as "open" | "settled";
  const categoryLabel = String(formData.get("categoryLabel") ?? "").trim();

  if (!title) {
    redirect(buildRedirectUrl(kind, formData, buildMissingFieldError("title")));
  }

  if (!accountLabel) {
    redirect(buildRedirectUrl(kind, formData, buildMissingFieldError("accountLabel")));
  }

  if (!amountRaw) {
    redirect(buildRedirectUrl(kind, formData, buildMissingFieldError("amount")));
  }

  if (!dueDate) {
    redirect(buildRedirectUrl(kind, formData, buildMissingFieldError("dueDate")));
  }

  if (!categoryLabel) {
    redirect(buildRedirectUrl(kind, formData, buildMissingFieldError("categoryLabel")));
  }

  const amount = parseAmountInput(amountRaw);

  if (amount === null) {
    redirect(
      buildRedirectUrl(
        kind,
        formData,
        "Valor invalido: use um formato numerico como 1500, 1500,45 ou 1.500,45."
      )
    );
  }

  const normalizedDueDate = parseOperationalDate(dueDate);

  if (!normalizedDueDate) {
    redirect(buildRedirectUrl(kind, formData, "Data invalida: use 07/05/2026 ou 2026-05-07."));
  }

  await createFinancialEntry({
    kind,
    title,
    description,
    accountLabel,
    counterpartyLabel,
    amount,
    dueDate: normalizedDueDate,
    status,
    categoryLabel,
    clientId: String(formData.get("clientId") ?? "") || undefined,
    caseId: String(formData.get("caseId") ?? "") || undefined,
    settledAt: status === "settled" ? normalizedDueDate : undefined
  });

  redirect(targetPathByKind[kind]);
}
