import { WorkspaceStatePanel } from "@lexia/ui";

import { uploadDocumentAction } from "@/app/(workspace)/documentos/enviar-arquivos/actions";
import { getCases } from "@/server/services/cases/get-cases";

const documentTypes = [
  "Contrato bancario",
  "CCB",
  "Peticao",
  "Comprovante",
  "Planilha",
  "Notificacao"
];

export default async function EnviarArquivosPage({
  searchParams
}: {
  searchParams?: { caseId?: string };
}) {
  let cases: Awaited<ReturnType<typeof getCases>> = [];
  let state: { title: string; description: string; tone?: "neutral" | "warning" | "danger" } | null = null;
  const uploadFormAction = uploadDocumentAction as unknown as string;

  try {
    cases = await getCases();
  } catch {
    state = {
      title: "Envio indisponivel no momento",
      description:
        "Nao foi possivel carregar casos reais do tenant ativo para vincular o arquivo.",
      tone: "danger"
    };
  }

  if (state) {
    return (
      <WorkspaceStatePanel
        actionHref="/documentos/meus-arquivos"
        actionLabel="Abrir meus arquivos"
        description={state.description}
        title={state.title}
        tone={state.tone ?? "neutral"}
      />
    );
  }

  if (!cases.length) {
    return (
      <WorkspaceStatePanel
        actionHref="/processos"
        actionLabel="Abrir processos"
        description="Cadastre ou sincronize um caso real antes de enviar documentos. O upload exige vinculacao obrigatoria com caso e cliente do tenant."
        title="Nenhum caso disponivel para upload"
        tone="warning"
      />
    );
  }

  const defaultCaseId = cases.some((caseItem) => caseItem.id === searchParams?.caseId)
    ? searchParams?.caseId
    : cases[0]?.id;

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mj-model-title">Enviar arquivos</p>
          <p className="mj-model-subtitle">
            Upload real para Supabase Storage com registro documental vinculado ao tenant.
          </p>
        </div>
      </div>

      <form action={uploadFormAction} className="mj-model-panel overflow-hidden">
        <div className="grid gap-4 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div
            className="flex min-h-[24rem] flex-col items-center justify-center border border-dashed px-6 text-center mj-model-gridline"
            style={{ borderRadius: "4px" }}
          >
            <svg aria-hidden="true" className="h-14 w-14 text-slate-400" fill="none" viewBox="0 0 48 48">
              <path d="M24 31V12m0 0-7 7m7-7 7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              <path d="M14 34h20" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
            </svg>
            <p className="mt-4 text-[15px] font-semibold text-slate-200">
              Selecione o arquivo que sera enviado ao storage do tenant.
            </p>
            <p className="mt-2 max-w-[34rem] text-[13px] leading-6 text-slate-400">
              Formatos aceitos: PDF, DOC, DOCX, JPG, PNG e ZIP. Tamanho maximo por envio: 30 MB.
            </p>
            <input
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
              className="mj-model-input mt-5 w-full max-w-[28rem] px-3 py-2 text-[13px] outline-none"
              name="file"
              required
              type="file"
            />
          </div>

          <aside className="mj-model-panel px-4 py-4">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Vinculacao obrigatoria
            </p>

            <label className="mt-4 block text-[12px] font-semibold text-slate-400" htmlFor="caseId">
              Caso
            </label>
            <select
              className="mj-model-input mt-1 w-full px-3 py-2 text-[13px] outline-none"
              defaultValue={defaultCaseId}
              id="caseId"
              name="caseId"
              required
            >
              {cases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.client.fullName} | {caseItem.title}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-[12px] font-semibold text-slate-400" htmlFor="documentType">
              Tipo documental
            </label>
            <select
              className="mj-model-input mt-1 w-full px-3 py-2 text-[13px] outline-none"
              id="documentType"
              name="documentType"
              required
            >
              {documentTypes.map((documentType) => (
                <option key={documentType} value={documentType}>
                  {documentType}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-[12px] font-semibold text-slate-400" htmlFor="category">
              Categoria
            </label>
            <input
              className="mj-model-input mt-1 w-full px-3 py-2 text-[13px] outline-none"
              id="category"
              name="category"
              placeholder="Contratos, provas, calculos..."
              required
              type="text"
            />

            <label className="mt-4 block text-[12px] font-semibold text-slate-400" htmlFor="tags">
              Tags
            </label>
            <input
              className="mj-model-input mt-1 w-full px-3 py-2 text-[13px] outline-none"
              id="tags"
              name="tags"
              placeholder="contrato, urgencia, calculo"
              type="text"
            />

            <label className="mt-4 block text-[12px] font-semibold text-slate-400" htmlFor="summary">
              Observacao inicial
            </label>
            <textarea
              className="mj-model-input mt-1 min-h-[7rem] w-full px-3 py-2 text-[13px] outline-none"
              id="summary"
              name="summary"
              placeholder="Contexto operacional para Clara e equipe."
            />

            <button className="mj-model-button-green mt-5 w-full justify-center" type="submit">
              Enviar arquivo
            </button>
          </aside>
        </div>
      </form>
    </div>
  );
}
