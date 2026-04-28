import { notFound, redirect } from "next/navigation";

const canonicalFinanceRoutes = new Set([
  "despesas",
  "receitas",
  "transferencias",
  "vencimentos",
  "graficos"
]);

export default function FinanceiroSubpage({
  params
}: {
  params: { subpage: string };
}) {
  if (canonicalFinanceRoutes.has(params.subpage)) {
    redirect(`/financeiro/${params.subpage}`);
  }

  notFound();
}
