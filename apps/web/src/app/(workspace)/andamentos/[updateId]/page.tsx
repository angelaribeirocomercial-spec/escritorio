import Link from "next/link";
import { notFound } from "next/navigation";

import { ClaraContextActions } from "@/components/layout/clara-context-actions";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { getProceduralUpdateById } from "@/server/services/procedural-updates/get-procedural-updates";

function criticalityLabel(criticality: string) {
  switch (criticality) {
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    default:
      return "Baixa";
  }
}

export default async function ProceduralUpdateDetailPage({
  params
}: {
  params: { updateId: string };
}) {
  const update = await getProceduralUpdateById(params.updateId);

  if (!update) {
    notFound();
  }

  const metrics = [
    { label: "Criticidade", value: criticalityLabel(update.criticality) },
    { label: "Tipo", value: update.movementType },
    { label: "Processo", value: update.judicialProcess.processNumber },
    {
      label: "Data",
      value: new Date(update.occurredAt).toLocaleDateString("pt-BR")
    }
  ];

  return (
    <WorkspacePage
      description="Workspace do andamento com separacao explicita entre movimento do tribunal, resumo operacional e interpretacao contextual da Clara."
      eyebrow="Andamento Processual"
      metrics={metrics}
      title={update.movementType}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-slate-400">
          {update.client.fullName} · {update.bankingCase.bankName} ·{" "}
          {update.judicialProcess.processNumber}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href={`/processos/${update.judicialProcess.id}`}
          >
            Abrir processo
          </Link>
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href="/andamentos"
          >
            Voltar para andamentos
          </Link>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Movimento bruto</p>
          <div className="detail-subpanel mt-5 p-5">
            <p className="text-sm leading-7 text-slate-200">{update.rawMovement}</p>
          </div>
          <dl className="mt-5 grid gap-3 md:grid-cols-2 text-sm">
            <div className="detail-soft-row px-4 py-4">
              <dt className="text-slate-500">Fonte</dt>
              <dd className="mt-2 text-white">{update.sourceCourt}</dd>
            </div>
            <div className="detail-soft-row px-4 py-4">
              <dt className="text-slate-500">Resumo operacional</dt>
              <dd className="mt-2 text-white">{update.operationalSummary}</dd>
            </div>
          </dl>
        </article>

        <article className="detail-panel-accent p-6">
          <p className="text-sm font-semibold text-white">Leitura da Clara</p>
          <div className="detail-subpanel mt-5 p-5">
            <p className="text-sm leading-7 text-slate-200">{update.claraImpactSummary}</p>
          </div>
          <div className="detail-soft-row mt-5 px-4 py-4 text-sm text-slate-300">
            Cautela: <span className="font-semibold text-white">{update.claraCaution}</span>
          </div>
        </article>
      </section>

      <section className="detail-panel p-6">
        <p className="text-sm font-semibold text-white">Contexto vinculado</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Processo
            </p>
            <p className="mt-2 font-medium text-white">{update.judicialProcess.processNumber}</p>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Fase
            </p>
            <p className="mt-2 font-medium text-white">{update.judicialProcess.proceduralPhase}</p>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Banco
            </p>
            <p className="mt-2 font-medium text-white">{update.bankingCase.bankName}</p>
          </div>
          <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tese
            </p>
            <p className="mt-2 font-medium text-white">{update.bankingCase.mainThesis}</p>
          </div>
        </div>
      </section>

      <ClaraContextActions
        basis={[
          update.movementType,
          update.sourceLabel,
          update.judicialProcess.processNumber,
          update.bankingCase.mainThesis,
          `criticidade ${criticalityLabel(update.criticality).toLowerCase()}`
        ]}
        cautionLabel={update.claraCaution}
        conclusion={update.claraImpactSummary}
        eyebrow="Clara no Andamento"
        nextActions={update.claraNextActions}
        title="Leitura contextual da Clara para o andamento"
      />
    </WorkspacePage>
  );
}
