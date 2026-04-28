import Link from "next/link";
import { notFound } from "next/navigation";
import { getBankingNicheLabel } from "@lexia/domain";
import { WorkspaceStatePanel } from "@lexia/ui";

import { ClaraContextActions } from "@/components/layout/clara-context-actions";
import { WorkspacePage } from "@/components/layout/workspace-page";
import {
  getClaraRecord,
  getClaraRecordDisplay,
  listClaraRecords
} from "@/server/services/clara/clara-record-store";
import { getClaraClientArtifact } from "@/server/services/clara/get-clara-artifacts";
import { getCases } from "@/server/services/cases/get-cases";
import { getBankingCaseWorkflow } from "@/server/services/cases/get-banking-case-workflow";
import { getClientById } from "@/server/services/clients/get-clients";
import { getDocumentsByCaseId } from "@/server/services/documents/get-documents";

export default async function ClientDetailPage({
  params,
  searchParams
}: {
  params: { clientId: string };
    searchParams?: {
      clara?: string;
      record?: string;
      action?: string;
      case?: string;
      onboarding?: string;
      workflow?: string;
      uploaded?: string;
    };
  }) {
  let client = null;

  try {
    client = await getClientById(params.clientId);
  } catch {
    return (
      <WorkspacePage
        description="Nao foi possivel abrir o detalhe do cliente na base real."
        eyebrow="Cliente"
        metrics={[
          { label: "Estado", value: "Indisponivel" },
          { label: "Fonte", value: "Supabase" },
          { label: "Tenant", value: "Nao resolvido" },
          { label: "Acao", value: "Validar vertical" }
        ]}
        title="Detalhe indisponivel"
      >
        <WorkspaceStatePanel
          actionHref="/pessoas/clientes"
          actionLabel="Voltar para clientes"
          description="Valide a configuracao do Supabase, as migrations da vertical de clientes e a seed do tenant ativo."
          title="Falha ao carregar cliente"
          tone="danger"
        />
      </WorkspacePage>
    );
  }

  if (!client) {
    notFound();
  }

  const claraRecord = await getClaraRecord(searchParams?.record);
  const relatedClaraRecords = (await listClaraRecords(80)).filter((record) => {
    if (record.kind !== "client") {
      return false;
    }

    const payload = record.payload as Awaited<ReturnType<typeof getClaraClientArtifact>>;
    return payload.clientLabel === client.fullName;
  });
  const claraArtifact =
    claraRecord?.kind === "client"
      ? (claraRecord.payload as Awaited<ReturnType<typeof getClaraClientArtifact>>)
      : searchParams?.clara
        ? await getClaraClientArtifact(params.clientId, searchParams.case, false)
        : null;
  const claraDisplay = claraArtifact
    ? getClaraRecordDisplay(claraRecord, "Resumo de relacionamento carregado", claraArtifact.summary)
    : null;
  const clientCases = (await getCases()).filter((caseItem) => caseItem.clientId === params.clientId);
  const activeCase =
    (searchParams?.case ? clientCases.find((caseItem) => caseItem.id === searchParams.case) : null) ??
    clientCases[0] ??
    null;
  const caseDocuments = activeCase ? await getDocumentsByCaseId(activeCase.id) : [];
  const workflow = activeCase
    ? getBankingCaseWorkflow(activeCase, {
        documentLabels: caseDocuments.map((document) => document.documentType)
      })
    : null;
  const nextStepLabel = activeCase
    ? workflow?.nextStep ??
      (activeCase.niche === "revisional"
        ? "Anexar contrato e documentos para seguir na analise revisional."
        : activeCase.niche === "fraude"
          ? "Consolidar cronologia e documentos para fechar a triagem da fraude."
          : "Reunir contrato e urgencia para seguir no fluxo de busca e apreensao.")
    : "Abrir o primeiro caso bancario deste cliente.";

  const metrics = [
    {
      label: "Score de Viabilidade",
      value: client.legalViabilityScore.toFixed(1).replace(".", ",")
    },
    { label: "Casos Vinculados", value: `${client.linkedCases.length}` },
      { label: "Documentos", value: `${client.documentsSent}` },
      { label: "Contrato", value: client.signedContract ? "Assinado" : "Pendente" }
  ];

  function workflowStatusLabel(status: "created" | "reviewed" | "completed") {
    switch (status) {
      case "reviewed":
        return "Revisado";
      case "completed":
        return "Concluido";
      default:
        return "Criado";
    }
  }

  return (
    <WorkspacePage
      description="Visao individual do cliente com contexto comercial, bancario e juridico para triagem, conducao e proxima melhor acao do escritorio."
      eyebrow="Cliente"
      metrics={metrics}
      title={client.fullName}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-slate-400">
          {client.documentId} | {client.bankName} | Origem {client.leadSource}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href={`/clara?tab=proximos-passos&client=${params.clientId}#clara-workbench`}
          >
            Continuar na Clara
          </Link>
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href="/pessoas/clientes"
          >
            Voltar para clientes
          </Link>
        </div>
      </div>

      {claraArtifact ? (
        <WorkspaceStatePanel
          actionHref={`/clara?tab=proximos-passos&client=${params.clientId}#clara-history`}
          actionLabel="Ver historico completo na Clara"
          description={`${claraDisplay?.title}: ${claraDisplay?.detail}`}
          footer={`Status ${claraArtifact.statusLabel} | Etapa ${claraArtifact.stageLabel} | Registro ${claraArtifact.recordId}`}
          title="Resumo ativo da Clara para este cliente"
          tone="warning"
        />
      ) : null}

      {searchParams?.onboarding === "1" && activeCase ? (
        <WorkspaceStatePanel
          actionHref={`/documentos/enviar-arquivos?caseId=${activeCase.id}`}
          actionLabel="Anexar documentos complementares"
          description="O cliente e o caso foram criados pela entrada unica com documentos essenciais, checklist inicial e tarefas minimas. Use esta rota apenas para complementar a base documental do caso."
          title="Atendimento bancario iniciado com sucesso"
          tone="warning"
        />
      ) : null}

      {searchParams?.uploaded === "1" && activeCase ? (
        <WorkspaceStatePanel
          actionHref={`/pessoas/clientes/${params.clientId}?case=${activeCase.id}`}
          actionLabel="Continuar no cockpit do caso"
          description="O documento foi vinculado ao caso ativo. Agora o cockpit mostra a base documental recebida e o que ainda falta para seguir o workflow."
          title="Documento enviado com sucesso"
          tone="warning"
        />
      ) : null}

      {activeCase ? (
        <section className="detail-panel-accent p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Cockpit inicial do caso</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                O cliente agora concentra o caso ativo, o nicho escolhido e o proximo passo operacional do fluxo.
              </p>
            </div>
            <Link
              className="detail-link-button px-4 py-3 text-sm font-semibold"
              href={`/documentos/enviar-arquivos?caseId=${activeCase.id}`}
            >
              Anexar documentos
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Caso ativo: <span className="font-semibold text-white">{activeCase.title}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Nicho: <span className="font-semibold text-white">{getBankingNicheLabel(activeCase.niche)}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Fase atual: <span className="font-semibold text-white">{workflow?.phaseLabel ?? activeCase.stage}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Base documental:{" "}
              <span className="font-semibold text-white">{workflow?.completionLabel ?? `${caseDocuments.length} documento(s)`}</span>
            </div>
          </div>

          <div className="detail-subpanel mt-4 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Proximo passo sugerido
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-200">{nextStepLabel}</p>
          </div>
        </section>
      ) : null}

      {activeCase && workflow ? (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="detail-panel p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Workflow do nicho</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Primeira trilha visivel do caso {getBankingNicheLabel(activeCase.niche).toLowerCase()} dentro do cockpit do cliente.
                </p>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                {workflow.phaseLabel}
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {workflow.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`rounded-[4px] border px-4 py-4 text-sm ${
                    step.state === "done"
                      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-50"
                      : step.state === "current"
                        ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-50"
                        : "border-white/10 bg-white/[0.03] text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current/20 text-xs font-semibold">
                      {index + 1}
                    </span>
                    <p className="font-semibold">{step.title}</p>
                  </div>
                  <p className="mt-3 leading-6">{step.detail}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="detail-panel p-6">
            <p className="text-sm font-semibold text-white">Base documental do caso</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              O cockpit agora mostra o que ja entrou no caso e o que ainda falta para seguir o fluxo sem depender de leitura solta em outras telas.
            </p>

            <div className="detail-subpanel mt-5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Documentos-base esperados
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                {workflow.requiredDocuments.map((item) => {
                  const isMissing = workflow.missingDocuments.includes(item);

                  return (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                          isMissing ? "bg-amber-300" : "bg-emerald-300"
                        }`}
                      />
                      <span>{item}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Recebidos no caso: <span className="font-semibold text-white">{caseDocuments.length}</span>
              </div>
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                Pendencias documentais:{" "}
                <span className="font-semibold text-white">{workflow.missingDocuments.length}</span>
              </div>
            </div>

            {caseDocuments.length ? (
              <div className="mt-4 grid gap-3">
                {caseDocuments.slice(0, 4).map((document) => (
                  <div key={document.id} className="detail-soft-row px-4 py-4 text-sm text-slate-300">
                    <p className="font-semibold text-white">{document.documentType}</p>
                    <p className="mt-1 text-slate-400">{document.fileName}</p>
                    <p className="mt-2">{document.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="detail-soft-row mt-4 px-4 py-4 text-sm text-slate-400">
                Nenhum documento vinculado ao caso ativo ainda.
              </div>
            )}
          </article>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Visao geral</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Contato</dt>
              <dd className="mt-1 text-slate-200">
                {client.email}
                <br />
                {client.phone}
                <br />
                WhatsApp {client.whatsapp}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Endereco</dt>
              <dd className="mt-1 text-slate-200">{client.address}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Honorarios</dt>
              <dd className="mt-1 text-slate-200">{client.feesLabel}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Notas internas</dt>
              <dd className="mt-1 text-slate-200">{client.notes}</dd>
            </div>
          </dl>
        </article>

        <article className="detail-panel-accent p-6">
          <p className="text-sm font-semibold text-white">Contexto da Clara</p>
          <div className="detail-subpanel mt-5 p-5">
            <p className="text-sm leading-7 text-slate-200">{client.iaContext}</p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Banco envolvido: <span className="font-semibold text-white">{client.bankName}</span>
            </div>
            <div className="detail-soft-row px-4 py-4 text-sm text-slate-300">
              Status do atendimento:{" "}
              <span className="font-semibold text-white">{client.serviceStatus}</span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="detail-panel p-6 lg:col-span-3">
          <p className="text-sm font-semibold text-white">Historico da Clara neste cliente</p>
          <div className="mt-5 grid gap-3">
            {relatedClaraRecords.length ? (
              relatedClaraRecords.slice(0, 6).map((record) => {
                const display = getClaraRecordDisplay(
                  record,
                  "Resumo de relacionamento registrado",
                  "Sem resumo adicional."
                );

                return (
                  <Link
                    key={record.id}
                    className="detail-soft-row block px-4 py-4 text-sm text-slate-300"
                    href={`/pessoas/clientes/${params.clientId}?record=${record.id}`}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="rounded-full border border-white/10 px-2 py-1 text-slate-300">
                        {workflowStatusLabel(record.workflowStatus)}
                      </span>
                      <span>{record.id}</span>
                    </div>
                    <p className="mt-3 font-semibold text-white">{display.title}</p>
                    <p className="mt-2 leading-6 text-slate-300">{display.detail}</p>
                  </Link>
                );
              })
            ) : (
              <div className="detail-soft-row px-4 py-4 text-sm text-slate-400">
                Nenhum registro da Clara foi persistido neste cliente ainda.
              </div>
            )}
          </div>
        </article>

        <article className="detail-panel p-6 lg:col-span-2">
          <p className="text-sm font-semibold text-white">Casos vinculados</p>
          <div className="mt-5 grid gap-3">
            {client.linkedCases.map((caseItem) => (
              <div key={caseItem.id} className="detail-soft-row px-4 py-4 text-sm">
                <p className="font-semibold text-white">{caseItem.title}</p>
                <p className="mt-1 text-slate-400">{caseItem.status}</p>
                <p className="mt-2 text-slate-300">{caseItem.thesis}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Documentos vinculados</p>
          <ul className="mt-5 space-y-3">
            {client.linkedDocuments.map((document) => (
              <li key={document} className="detail-soft-row px-4 py-3 text-sm text-slate-300">
                {document}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="detail-panel p-6">
        <p className="text-sm font-semibold text-white">Timeline de atendimento</p>
        <ol className="mt-5 space-y-3">
          {client.timeline.map((entry, index) => (
            <li
              key={entry}
              className="detail-soft-row flex gap-4 px-4 py-4 text-sm text-slate-300"
            >
              <span className="detail-step-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                {index + 1}
              </span>
              <span>{entry}</span>
            </li>
          ))}
        </ol>
      </section>

      <ClaraContextActions
        actionHref={`/clara?tab=proximos-passos&client=${params.clientId}#clara-workbench`}
        basis={[
          client.serviceStatus,
          client.bankName,
          `${client.documentsSent} documentos`,
          `${client.linkedCases.length} caso(s) vinculado(s)`
        ]}
        cautionLabel="A triagem e as orientacoes da Clara devem ser confirmadas pelo advogado responsavel."
        conclusion="O melhor uso da IA neste cliente e fechar pendencias documentais, reforcar a leitura de viabilidade e transformar isso em proxima acao objetiva do escritorio."
        eyebrow="Fluxo Clara"
        nextActions={[
          "Listar documentos faltantes",
          "Montar atualizacao ao cliente",
          "Gerar checklist de onboarding juridico"
        ]}
        title="Continuar este cliente dentro da Clara"
      />
    </WorkspacePage>
  );
}
