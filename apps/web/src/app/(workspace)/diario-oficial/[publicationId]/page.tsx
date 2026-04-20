import Link from "next/link";
import { notFound } from "next/navigation";

import { ClaraContextActions } from "@/components/layout/clara-context-actions";
import { WorkspacePage } from "@/components/layout/workspace-page";
import {
  getOfficialDiaryPublicationById,
  getOfficialDiaryTaskDraft
} from "@/server/services/official-diary/get-official-diary";

function urgencyLabel(urgency: string) {
  switch (urgency) {
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    default:
      return "Baixa";
  }
}

export default async function OfficialDiaryDetailPage({
  params
}: {
  params: { publicationId: string };
}) {
  const publication = await getOfficialDiaryPublicationById(params.publicationId);

  if (!publication) {
    notFound();
  }

  const taskDraft = await getOfficialDiaryTaskDraft(publication.id);

  const metrics = [
    { label: "Urgencia", value: urgencyLabel(publication.urgency) },
    {
      label: "Publicacao",
      value: new Date(publication.publishedAt).toLocaleDateString("pt-BR")
    },
    { label: "Processo", value: publication.judicialProcess.processNumber },
    { label: "Fonte", value: publication.sourceLabel }
  ];

  return (
    <WorkspacePage
      description="Workspace de triagem da publicacao com texto bruto, leitura bancaria, contexto processual e ponte operacional para tarefa preparada."
      eyebrow="Publicacao do Diario Oficial"
      metrics={metrics}
      title={publication.title}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-slate-400">
          {publication.client.fullName} · {publication.bankingCase.bankName} ·{" "}
          {publication.judicialProcess.processNumber}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href={`/processos/${publication.judicialProcess.id}`}
          >
            Abrir processo
          </Link>
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href="/diario-oficial"
          >
            Voltar para publicacoes
          </Link>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Texto bruto da publicacao</p>
          <div className="detail-subpanel mt-5 p-5">
            <p className="text-sm leading-7 text-slate-200">{publication.rawContext}</p>
          </div>
          <dl className="mt-5 grid gap-3 md:grid-cols-2 text-sm">
            <div className="detail-soft-row px-4 py-4">
              <dt className="text-slate-500">Tribunal/Fonte</dt>
              <dd className="mt-2 text-white">{publication.sourceCourt}</dd>
            </div>
            <div className="detail-soft-row px-4 py-4">
              <dt className="text-slate-500">Responsavel</dt>
              <dd className="mt-2 text-white">{publication.responsibleLawyer}</dd>
            </div>
          </dl>
        </article>

        <article className="detail-panel-accent p-6">
          <p className="text-sm font-semibold text-white">Leitura bancaria do ADVX</p>
          <div className="detail-subpanel mt-5 p-5">
            <p className="text-sm leading-7 text-slate-200">
              {publication.bankingSummary}
            </p>
          </div>
          <div className="mt-5 grid gap-3">
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Acao exigida:{" "}
              <span className="font-semibold text-white">{publication.requiredAction}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Caso bancario:{" "}
              <span className="font-semibold text-white">{publication.bankingCase.title}</span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Contexto processual vinculado</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Processo</dt>
              <dd className="mt-1 text-slate-200">
                {publication.judicialProcess.processNumber}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Fase</dt>
              <dd className="mt-1 text-slate-200">
                {publication.judicialProcess.proceduralPhase}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Banco</dt>
              <dd className="mt-1 text-slate-200">{publication.bankingCase.bankName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Tese principal</dt>
              <dd className="mt-1 text-slate-200">
                {publication.bankingCase.mainThesis}
              </dd>
            </div>
          </dl>
        </article>

        <article className="detail-panel-accent p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Tarefa preparada</p>
              <p className="mt-1 text-sm text-amber-100/80">
                Publicacao como evento-fonte, tarefa como proxima acao.
              </p>
            </div>
            <Link
              className="rounded-[18px] bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-soft"
              href={`/agenda/tarefas?publication=${publication.id}`}
            >
              Levar para tarefas
            </Link>
          </div>
          {taskDraft ? (
            <div className="detail-subpanel mt-5 p-5">
              <p className="text-lg font-semibold text-white">{taskDraft.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                {taskDraft.description}
              </p>
              <p className="mt-4 text-sm text-amber-100/85">
                Prioridade sugerida: {taskDraft.priority}
              </p>
            </div>
          ) : null}
        </article>
      </section>

      <ClaraContextActions
        basis={[
          publication.sourceLabel,
          publication.judicialProcess.processNumber,
          publication.bankingCase.mainThesis,
          `urgencia ${urgencyLabel(publication.urgency).toLowerCase()}`,
          publication.requiredAction
        ]}
        cautionLabel="A publicacao precisa ser conferida pelo advogado responsavel antes de qualquer resposta formal ou movimentacao processual."
        conclusion="A publicacao ja esta contextualizada o bastante para a Clara apontar impacto, urgencia e a proxima medida que deve entrar no fluxo operacional."
        eyebrow="Clara na Publicacao"
        nextActions={[
          "Resumir impacto processual",
          "Montar tarefa a partir da publicacao",
          "Revisar urgencia e prazo interno"
        ]}
        title="Leitura contextual da Clara para o Diario Oficial"
      />
    </WorkspacePage>
  );
}
