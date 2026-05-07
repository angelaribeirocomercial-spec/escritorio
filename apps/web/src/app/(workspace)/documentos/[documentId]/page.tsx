import Link from "next/link";
import { notFound } from "next/navigation";

import { WorkspaceStatePanel } from "@lexia/ui";

import { ClaraContextActions } from "@/components/layout/clara-context-actions";
import { WorkspacePage } from "@/components/layout/workspace-page";
import { getDocumentFileSignedUrl } from "@/server/services/documents/get-document-file-url";
import { getDocumentById } from "@/server/services/documents/get-documents";

function aiStatusLabel(status: string) {
  switch (status) {
    case "analyzed":
      return "Lido";
    case "needs_review":
      return "Revisao humana";
    default:
      return "Aguardando OCR";
  }
}

export default async function DocumentDetailPage({
  params
}: {
  params: { documentId: string };
}) {
  let document = null;

  try {
    document = await getDocumentById(params.documentId);
  } catch {
    return (
      <WorkspacePage
        description="Nao foi possivel abrir o detalhe do documento na base real."
        eyebrow="Documento"
        metrics={[
          { label: "Estado", value: "Indisponivel" },
          { label: "Fonte", value: "Supabase" },
          { label: "Tenant", value: "Nao resolvido" },
          { label: "Acao", value: "Validar vertical" }
        ]}
        title="Detalhe indisponivel"
      >
        <WorkspaceStatePanel
          actionHref="/documentos/meus-arquivos"
          actionLabel="Voltar para documentos"
          description="Valide a configuracao do Supabase, as migrations da vertical de documentos e a seed do tenant ativo."
          title="Falha ao carregar documento"
          tone="danger"
        />
      </WorkspacePage>
    );
  }

  if (!document) {
    notFound();
  }

  const metrics = [
    { label: "Paginas", value: `${document.pageCount}` },
    { label: "Leitura OCR", value: aiStatusLabel(document.aiStatus) },
    { label: "Cliente", value: document.client.fullName },
    { label: "Arquivo", value: document.storageSizeBytes ? `${Math.ceil(document.storageSizeBytes / 1024)} KB` : "Pendente" }
  ];
  const signedUrl = await getDocumentFileSignedUrl({
    bucket: document.storageBucket,
    path: document.storagePath
  });

  return (
    <WorkspacePage
      description="Visualizacao documental com metadata, contexto juridico e acoes da Clara para transformar documento em decisao."
      eyebrow="Documento"
      metrics={metrics}
      title={document.fileName}
    >
      <div className="flex flex-col gap-4 rounded-[4px] border border-white/10 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Documento em foco</p>
          <p className="mt-2 text-sm text-slate-300">
            {document.documentType} | {document.client.fullName} | {document.bankingCase.title}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {["Contrato bancario", "CCB"].includes(document.documentType) ? (
            <Link
              className="rounded-[4px] bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-soft"
              href={`/analise-contrato?documentId=${document.id}`}
            >
              Abrir analise premium
            </Link>
          ) : null}
          {signedUrl ? (
            <a className="detail-link-button px-4 py-2.5 text-sm font-semibold" href={signedUrl}>
              Baixar arquivo
            </a>
          ) : null}
          <Link className="detail-link-button px-4 py-2.5 text-sm font-semibold" href="/documentos">
            Voltar para documentos
          </Link>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="detail-panel p-5">
          <p className="text-sm font-semibold text-white">Preview do documento</p>
          <div className="detail-subpanel mt-4 flex min-h-[20rem] items-center justify-center border border-dashed p-8 text-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Preview indisponivel
              </p>
              <p className="mt-4 text-lg font-semibold text-white">{document.previewLabel}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Esta area depende de preview de PDF, OCR e leitura estruturada antes de exibir o arquivo processado.
              </p>
            </div>
          </div>
        </article>

        <article className="detail-panel p-5">
          <p className="text-sm font-semibold text-white">Metadata e contexto</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="detail-subpanel p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Leitura OCR</dt>
              <dd className="mt-2 text-sm text-slate-200">{aiStatusLabel(document.aiStatus)}</dd>
            </div>
            <div className="detail-subpanel p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Categoria</dt>
              <dd className="mt-2 text-sm text-slate-200">{document.category}</dd>
            </div>
            <div className="detail-subpanel p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cliente vinculado</dt>
              <dd className="mt-2 text-sm text-slate-200">{document.client.fullName}</dd>
            </div>
            <div className="detail-subpanel p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Caso vinculado</dt>
              <dd className="mt-2 text-sm text-slate-200">{document.bankingCase.title}</dd>
            </div>
            <div className="detail-subpanel p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tipo e tamanho</dt>
              <dd className="mt-2 text-sm text-slate-200">
                {document.storageMimeType} | {document.storageSizeBytes} bytes
              </dd>
            </div>
            <div className="detail-subpanel p-4 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tags</dt>
              <dd className="mt-2 text-sm text-slate-200">{document.tags.join(" | ")}</dd>
            </div>
            <div className="detail-subpanel p-4 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Resumo</dt>
              <dd className="mt-2 text-sm leading-6 text-slate-200">{document.summary}</dd>
            </div>
            <div className="detail-subpanel p-4 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Revisao humana</dt>
              <dd className="mt-2 text-sm leading-6 text-slate-200">
                {document.aiStatus === "analyzed"
                  ? "Documento lido e pronto para uso operacional."
                  : "Documento aguardando leitura OCR ou conferencia humana antes do uso processual."}
              </dd>
            </div>
            <div className="detail-subpanel p-4 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Storage</dt>
              <dd className="mt-2 break-all text-sm text-slate-200">
                {document.storagePath || "Arquivo ainda nao enviado ao storage"}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="detail-panel-accent p-5">
          <p className="text-sm font-semibold text-white">Acoes contextuais da IA</p>
          <div className="mt-4 space-y-3">
            {document.actions.map((action, index) => (
              <div
                key={action}
                className="detail-soft-row flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-200"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-xs font-semibold text-slate-100">
                  {index + 1}
                </div>
                <span className="min-w-0">{action}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="detail-panel p-5">
          <p className="text-sm font-semibold text-white">Contexto do caso</p>
          <div className="detail-subpanel mt-4 space-y-3 p-4">
            <p className="text-sm leading-6 text-slate-300">
              Caso relacionado: <span className="font-semibold text-white">{document.bankingCase.title}</span>
            </p>
            <p className="text-sm leading-6 text-slate-300">
              Tese principal: <span className="font-semibold text-white">{document.bankingCase.mainThesis}</span>
            </p>
            <p className="text-sm leading-6 text-slate-300">
              Estrategia atual: {document.bankingCase.suggestedStrategy}
            </p>
          </div>
        </article>
      </section>

      <ClaraContextActions
        actionHref={`/clara?tab=comparador&document=${document.id}&case=${document.caseId}&client=${document.clientId}#clara-workbench`}
        basis={[
          document.documentType,
          document.category,
          aiStatusLabel(document.aiStatus),
          document.client.fullName,
          document.bankingCase.title
        ]}
        cautionLabel="A leitura documental da Clara e sugestiva e deve ser conferida antes de uso processual."
        conclusion="Este documento ja carrega contexto suficiente para virar resumo juridico, tese aplicavel ou insumo direto da proxima peca do caso."
        eyebrow="Fluxo Clara"
        nextActions={[
          "Resumir documento",
          "Extrair tese principal",
          "Buscar jurisprudencia relacionada"
        ]}
        title="Continuar este documento dentro da Clara"
      />
    </WorkspacePage>
  );
}
