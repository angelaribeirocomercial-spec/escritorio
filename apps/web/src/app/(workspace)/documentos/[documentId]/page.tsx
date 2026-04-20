import Link from "next/link";
import { notFound } from "next/navigation";

import { ClaraContextActions } from "@/components/layout/clara-context-actions";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { getDocumentById } from "@/server/services/documents/get-documents";

function aiStatusLabel(status: string) {
  switch (status) {
    case "analyzed":
      return "Analisado";
    case "needs_review":
      return "Revisao";
    default:
      return "Nao analisado";
  }
}

export default async function DocumentDetailPage({
  params
}: {
  params: { documentId: string };
}) {
  const document = await getDocumentById(params.documentId);

  if (!document) {
    notFound();
  }

  const metrics = [
    { label: "Paginas", value: `${document.pageCount}` },
    { label: "IA", value: aiStatusLabel(document.aiStatus) },
    { label: "Cliente", value: document.client.fullName },
    { label: "Caso", value: document.bankingCase.id }
  ];

  return (
    <WorkspacePage
      description="Visualizacao documental com metadata, contexto juridico e acoes contextuais da Clara para transformar documento em decisao."
      eyebrow="Documento"
      metrics={metrics}
      title={document.fileName}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-slate-400">
          {document.documentType} · {document.client.fullName} · {document.bankingCase.title}
        </p>
        <div className="flex items-center gap-3">
          {["Contrato bancario", "CCB"].includes(document.documentType) ? (
            <Link
              className="rounded-[18px] bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-soft"
              href={`/analise-contrato?documentId=${document.id}`}
            >
              Abrir analise premium
            </Link>
          ) : null}
          <Link
            className="detail-link-button px-4 py-3 text-sm font-semibold"
            href="/documentos"
          >
            Voltar para documentos
          </Link>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Preview do documento</p>
          <div className="detail-subpanel mt-5 flex min-h-[24rem] items-center justify-center border border-dashed p-8 text-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Preview mockado
              </p>
              <p className="mt-4 text-lg font-semibold text-white">{document.previewLabel}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Esta area esta pronta para receber preview de PDF, OCR e leitura estruturada nas proximas fases.
              </p>
            </div>
          </div>
        </article>

        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Metadata e contexto</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Categoria</dt>
              <dd className="mt-1 text-slate-200">{document.category}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Tags</dt>
              <dd className="mt-1 text-slate-200">{document.tags.join(" · ")}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Cliente vinculado</dt>
              <dd className="mt-1 text-slate-200">{document.client.fullName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Caso vinculado</dt>
              <dd className="mt-1 text-slate-200">{document.bankingCase.title}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Resumo</dt>
              <dd className="mt-1 text-slate-200">{document.summary}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="detail-panel-accent p-6">
          <p className="text-sm font-semibold text-white">Acoes contextuais da IA</p>
          <div className="mt-5 grid gap-3">
            {document.actions.map((action) => (
              <div
                key={action}
                className="detail-soft-row px-4 py-4 text-sm font-medium text-slate-200"
              >
                {action}
              </div>
            ))}
          </div>
        </article>

        <article className="detail-panel p-6">
          <p className="text-sm font-semibold text-white">Contexto do caso</p>
          <div className="detail-subpanel mt-5 p-5">
            <p className="text-sm leading-7 text-slate-300">
              Caso relacionado: <span className="font-semibold text-white">{document.bankingCase.title}</span>
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Tese principal: <span className="font-semibold text-white">{document.bankingCase.mainThesis}</span>
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Estrategia atual: {document.bankingCase.suggestedStrategy}
            </p>
          </div>
        </article>
      </section>

      <ClaraContextActions
        basis={[
          document.documentType,
          document.category,
          document.aiStatus,
          document.client.fullName,
          document.bankingCase.title
        ]}
        cautionLabel="A leitura documental da Clara e sugestiva e deve ser conferida antes de uso processual."
        conclusion="Este documento ja carrega contexto suficiente para virar resumo juridico, tese aplicavel ou insumo direto da proxima peca do caso."
        eyebrow="Clara no Documento"
        nextActions={[
          "Resumir documento",
          "Extrair tese principal",
          "Buscar jurisprudencia relacionada"
        ]}
        title="Acoes contextuais de leitura documental"
      />
    </WorkspacePage>
  );
}
