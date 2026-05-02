import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import { WorkspacePage } from "@/components/layout/workspace-page";
import { getCrmConversions } from "@/server/services/crm/get-crm-conversion";

export default async function CrmConversionPage() {
  let conversions: Awaited<ReturnType<typeof getCrmConversions>> = [];

  try {
    conversions = await getCrmConversions();
  } catch {
    return (
      <WorkspaceStatePanel
        actionHref="/crm"
        actionLabel="Voltar ao CRM"
        description="Nao foi possivel montar a visao de conversao real a partir da carteira ativa."
        title="Conversao do CRM indisponivel"
        tone="danger"
      />
    );
  }

  return (
    <WorkspacePage
      description="Conversao do lead para cliente e caso, pronta para receber o chatbot externo quando ele for integrado."
      eyebrow="CRM"
      metrics={[
        { label: "Leads", value: String(conversions.length) },
        { label: "Convertidos", value: String(conversions.filter((conversion) => conversion.caseId).length) },
        { label: "Com contrato", value: String(conversions.filter((conversion) => conversion.stageLabel === "Contrato fechado").length) },
        { label: "Foco atual", value: "Conversao assistida" }
      ]}
      title="Conversao do escritorio"
    >
      <section className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Fluxo de conversao</p>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
          Esta tela representa o handoff entre o lead captado e o caso juridico. O chatbot externo entra depois, mas a
          estrutura ja mostra origem, classificacao e proximo passo.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {conversions.map((conversion) => (
          <article key={conversion.id} className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{conversion.clientName}</p>
                <p className="mt-1 text-sm text-slate-400">{conversion.sourceLabel}</p>
              </div>
              <span className="rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                {conversion.stageLabel}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">{conversion.summary}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{conversion.nextAction}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                href={`/pessoas/clientes/${conversion.clientId}`}
              >
                Abrir cliente
              </Link>
              {conversion.caseId ? (
                <Link
                  className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                  href={`/casos/${conversion.caseId}`}
                >
                  Abrir caso
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </WorkspacePage>
  );
}
