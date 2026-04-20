import Link from "next/link";
import { notFound } from "next/navigation";

import { ClaraContextActions } from "@/components/layout/clara-context-actions";
import { WorkspacePage } from "@/components/layout/workspace-page";
import {
  getClaraRecord,
  getClaraRecordDisplay,
  listClaraRecords
} from "@/server/services/clara/clara-record-store";
import { getClaraClientArtifact } from "@/server/services/clara/get-clara-artifacts";
import { getClientById } from "@/server/services/clients/get-clients";

export default async function ClientDetailPage({
  params,
  searchParams
}: {
  params: { clientId: string };
  searchParams?: { clara?: string; record?: string; action?: string; case?: string };
}) {
  const client = await getClientById(params.clientId);
  const claraRecord = await getClaraRecord(searchParams?.record);
  const relatedClaraRecords = client
    ? (await listClaraRecords(80)).filter((record) => {
        if (record.kind !== "client") {
          return false;
        }

        const payload = record.payload as Awaited<ReturnType<typeof getClaraClientArtifact>>;
        return payload.clientLabel === client.fullName;
      })
    : [];
  const claraArtifact =
    claraRecord?.kind === "client"
      ? (claraRecord.payload as Awaited<ReturnType<typeof getClaraClientArtifact>>)
      : searchParams?.clara
        ? await getClaraClientArtifact(params.clientId, searchParams.case, false)
        : null;
  const claraDisplay = claraArtifact
    ? getClaraRecordDisplay(claraRecord, "Resumo de relacionamento carregado", claraArtifact.summary)
    : null;

  if (!client) {
    notFound();
  }

  const metrics = [
    { label: "Score de Viabilidade", value: client.legalViabilityScore.toFixed(1).replace(".", ",") },
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
      description="Visao individual do cliente com contexto comercial, bancario e juridico para triagem, condução e proxima melhor acao do escritorio."
      eyebrow="Cliente"
      metrics={metrics}
      title={client.fullName}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-slate-400">
          {client.documentId} · {client.bankName} · Origem {client.leadSource}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href={`/clara?tab=proximos-passos&client=${params.clientId}#clara-workbench`}
          >
            Abrir na Clara
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
        <section className="detail-panel-accent p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-100/85">
            Handoff da Clara
          </p>
          <h2 className="mt-3 text-lg font-semibold text-white">{claraDisplay?.title}</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full border border-white/10 px-2 py-1 text-white/90">
              {claraArtifact.statusLabel}
            </span>
            <span className="rounded-full border border-white/10 px-2 py-1 text-white/90">
              {claraArtifact.stageLabel}
            </span>
            <span className="rounded-full border border-white/10 px-2 py-1 text-white/90">
              {claraArtifact.recordId}
            </span>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-200">{claraDisplay?.detail}</p>
          {claraDisplay?.reviewNote ? (
            <p className="mt-3 text-sm leading-7 text-slate-300">Revisao humana: {claraDisplay.reviewNote}</p>
          ) : null}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
              Cliente: <span className="font-semibold text-white">{claraArtifact.clientLabel}</span>
            </div>
            <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
              Banco: <span className="font-semibold text-white">{claraArtifact.bankLabel}</span>
            </div>
            <div className="detail-soft-row px-4 py-3 text-sm text-slate-300">
              Caso base: <span className="font-semibold text-white">{claraArtifact.caseLabel}</span>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {claraArtifact.highlights.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
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
              <div
                key={caseItem.id}
                className="detail-soft-row px-4 py-4 text-sm"
              >
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
              <li
                key={document}
                className="detail-soft-row px-4 py-3 text-sm text-slate-300"
              >
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
        basis={[
          client.serviceStatus,
          client.bankName,
          `${client.documentsSent} documentos`,
          `${client.linkedCases.length} caso(s) vinculado(s)`
        ]}
        cautionLabel="A triagem e as orientacoes da Clara devem ser confirmadas pelo advogado responsavel."
        conclusion="O melhor uso da IA neste cliente e fechar pendencias documentais, reforcar a leitura de viabilidade e transformar isso em proxima acao objetiva do escritorio."
        eyebrow="Clara no Cliente"
        nextActions={[
          "Listar documentos faltantes",
          "Montar atualizacao ao cliente",
          "Gerar checklist de onboarding juridico"
        ]}
        title="Acoes contextuais de triagem e relacionamento"
      />
    </WorkspacePage>
  );
}
