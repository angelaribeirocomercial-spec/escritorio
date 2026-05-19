import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceStatePanel } from "@lexia/ui";

import { BANKING_NICHES, getBankingNicheLabel, type BankingNiche } from "@lexia/domain";

import {
  createClaraRecord,
  getClaraRecord,
  getClaraRecordDisplay,
  listClaraRecords,
  type ClaraRecord
} from "@/server/services/clara/clara-record-store";
import {
  getClaraMinuta,
  listClaraMinutas,
  type ClaraTextDraftRecord
} from "@/server/services/clara/clara-minutas-store";
import { getClaraTextDraftArtifact } from "@/server/services/clara/get-clara-artifacts";
import {
  buildRevisionalDraftBlocks,
  buildTextDraftDefaultBody,
  buildTextDraftDefaultTitle
} from "@/server/services/clara/clara-text-draft-renderer";
import { getCases } from "@/server/services/cases/get-cases";
import { getDocuments } from "@/server/services/documents/get-documents";
import { getProcesses } from "@/server/services/processes/get-processes";
import {
  updateClaraRecordContentAction,
  updateClaraReviewNoteAction,
  updateClaraWorkflowStatusAction
} from "@/app/(workspace)/clara/actions";
import { ClaraMinutaActions } from "@/components/layout/clara-minuta-actions";

type TextDraftPayload = Awaited<ReturnType<typeof getClaraTextDraftArtifact>>;

type CanonicalModel = {
  niche: BankingNiche;
  nicheLabel: string;
  clientName: string;
  caseLabel: string;
  caseId: string;
  documentId: string;
  documentLabel: string;
  processLabel: string;
  bankLabel: string;
  preview: string;
  pdfLink: string | null;
  pdfReady: boolean;
  statusLabel: string;
  stageLabel: string;
};

function buildDraftCreationTargetPath(searchParams?: {
  draft?: string;
  created?: string;
  niche?: string;
  client?: string;
  case?: string;
  document?: string;
  process?: string;
  piece?: string;
  objetivo?: string;
  source?: string;
  linked_update?: string;
  revisedInstallment?: string;
  estimatedTotalExcess?: string;
  chargedInstallment?: string;
  contractedInstallment?: string;
}) {
  if (!searchParams?.draft) {
    return null;
  }

  const params = new URLSearchParams();
  params.set("draft", searchParams.draft ?? "1");

  const pairs: Array<[string, string | undefined]> = [
    ["created", searchParams.created],
    ["niche", searchParams.niche],
    ["client", searchParams.client],
    ["case", searchParams.case],
    ["document", searchParams.document],
    ["process", searchParams.process],
    ["piece", searchParams.piece],
    ["objetivo", searchParams.objetivo],
    ["source", searchParams.source],
    ["linked_update", searchParams.linked_update],
    ["revisedInstallment", searchParams.revisedInstallment],
    ["estimatedTotalExcess", searchParams.estimatedTotalExcess],
    ["chargedInstallment", searchParams.chargedInstallment],
    ["contractedInstallment", searchParams.contractedInstallment]
  ];

  for (const [key, value] of pairs) {
    if (value) {
      params.set(key, value);
    }
  }

  return `/editor-de-texto/meus-textos?${params.toString()}`;
}

function isBankingNiche(value?: string): value is BankingNiche {
  return Boolean(value) && BANKING_NICHES.some((entry) => entry.value === value);
}

function isDistributionEligiblePiece(pieceLabel: string) {
  return pieceLabel === "acao-revisional" || pieceLabel === "peticao-inicial";
}

function getDraftSourceAction(pieceLabel: string) {
  switch (pieceLabel) {
    case "procuracao":
      return "Registrar minuta de procuracao";
    case "contrato-honorarios":
      return "Registrar minuta de contrato de honorarios";
    case "peticao-inicial":
      return "Registrar minuta de peticao inicial";
    default:
      return "Registrar minuta revisional";
  }
}

function buildDraftReturnPath(params: {
  searchParams?: {
    draft?: string;
    created?: string;
    niche?: string;
    client?: string;
    case?: string;
    document?: string;
    process?: string;
    piece?: string;
    objetivo?: string;
    source?: string;
    linked_update?: string;
    revisedInstallment?: string;
    estimatedTotalExcess?: string;
    chargedInstallment?: string;
    contractedInstallment?: string;
  };
  pieceLabel: string;
  caseId: string;
  documentId: string;
  objective?: string;
  niche?: BankingNiche | null;
}) {
  if (params.niche && isDistributionEligiblePiece(params.pieceLabel)) {
    return buildDistributionTargetPath({
      niche: params.niche,
      caseId: params.caseId,
      documentId: params.documentId,
      pieceLabel: params.pieceLabel,
      objective: params.objective
    });
  }

  return buildDraftCreationTargetPath({
    ...params.searchParams,
    case: params.caseId,
    document: params.documentId,
    piece: params.pieceLabel,
    objetivo: params.objective,
    source: params.searchParams?.source,
    linked_update: params.searchParams?.linked_update
  });
}

function findExistingDraftRecord(
  records: ClaraTextDraftRecord[],
  artifact: Awaited<ReturnType<typeof getClaraTextDraftArtifact>> | null
) {
  if (!artifact) {
    return null;
  }

  const matchingRecords = records.filter((record) => {
    const payload = record.payload as TextDraftPayload;
    return (
      payload.recordId === artifact.recordId ||
      (payload.caseId === artifact.caseId &&
        payload.documentId === artifact.documentId &&
        payload.pieceLabel === artifact.pieceLabel)
    );
  });

  return (
    matchingRecords.sort((left, right) => {
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    })[0] ?? null
  );
}

function buildDistributionTargetPath(params: {
  niche: BankingNiche;
  caseId: string;
  documentId: string;
  pieceLabel: string;
  objective?: string;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set("niche", params.niche);
  searchParams.set("case", params.caseId);
  searchParams.set("document", params.documentId);
  searchParams.set("piece", params.pieceLabel);
  searchParams.set("objetivo", params.objective ?? "Preparar acao revisional");
  searchParams.set("draft", "1");
  return `/editor-de-texto/distribuicao?${searchParams.toString()}`;
}

async function buildCanonicalModels(
  textDraftRecords: ClaraTextDraftRecord[]
): Promise<CanonicalModel[]> {
  const [cases, documents] = await Promise.all([getCases(), getDocuments()]);

  return Promise.all(
    BANKING_NICHES.map(async (entry) => {
      const bankingCase = cases.find((candidate) => candidate.niche === entry.value) ?? null;

      if (!bankingCase) {
        return {
          niche: entry.value,
          nicheLabel: entry.label,
          clientName: "Sem caso canônico",
          caseLabel: "Fluxo ainda nao consolidado",
          caseId: "",
          documentId: "",
          documentLabel: "Documento pendente",
          processLabel: "Processo pendente",
          bankLabel: "Banco pendente",
          preview: "Este nicho ainda nao tem caso canonico consolidado no tenant ativo.",
          pdfLink: null,
          pdfReady: false,
          statusLabel: "Pendente",
          stageLabel: "Aguardando base"
        } satisfies CanonicalModel;
      }

      const caseDocuments = documents.filter((document) => document.caseId === bankingCase.id);
      const firstDocument = caseDocuments[0] ?? null;
      const pieceLabel = bankingCase.niche === "revisional" ? "acao-revisional" : "peticao-inicial";
      const draftLink = firstDocument
        ? buildDraftCreationTargetPath({
            case: bankingCase.id,
            document: firstDocument.id,
            piece: pieceLabel,
            objetivo: "Preparar acao revisional",
            revisedInstallment: "R$ 1.598,00",
            estimatedTotalExcess: "R$ 17.864,00",
            chargedInstallment: "R$ 2.214,00",
            contractedInstallment: "R$ 1.842,00"
          })
        : null;
      const draftArtifact = firstDocument
        ? await getClaraTextDraftArtifact({
            caseId: bankingCase.id,
            documentId: firstDocument.id,
            piece: pieceLabel,
            objective: "Preparar acao revisional",
            committed: false
          })
        : null;
      const matchingDraft = draftArtifact
        ? textDraftRecords.find((record) => {
            const payload = record.payload as TextDraftPayload;
            return payload.recordId === draftArtifact.recordId;
          }) ?? null
        : null;

      return {
        niche: entry.value,
        nicheLabel: entry.label,
        clientName: bankingCase.client.fullName,
        caseLabel: bankingCase.title,
        caseId: bankingCase.id,
        documentId: firstDocument?.id ?? "",
        documentLabel: firstDocument?.fileName ?? "Documento pendente",
        processLabel: bankingCase.processNumber,
        bankLabel: bankingCase.bankName,
        preview: draftArtifact?.preview ?? "Modelo pronto para gerar minuta assistida.",
        pdfLink: draftLink,
        pdfReady: Boolean(matchingDraft),
        statusLabel: matchingDraft ? "PDF pronto" : "PDF por gerar",
        stageLabel: bankingCase.stage
      } satisfies CanonicalModel;
    })
  );
}

function DistributionPage({
  models,
  selectedNiche,
  draftArtifact,
  claraDisplay,
  claraRecord,
  processes
}: {
  models: CanonicalModel[];
  selectedNiche: BankingNiche | null;
  draftArtifact: Awaited<ReturnType<typeof getClaraTextDraftArtifact>> | null;
  claraDisplay: ReturnType<typeof getClaraRecordDisplay> | null;
  claraRecord: ClaraRecord | null;
  processes: Awaited<ReturnType<typeof getProcesses>>;
}) {
  const selectedModel = selectedNiche
    ? models.find((model) => model.niche === selectedNiche) ?? models[0] ?? null
    : models[0] ?? null;
  const processLabel =
    draftArtifact ? draftArtifact.processLabel : selectedModel?.processLabel ?? null;
  const bankLabel =
    draftArtifact ? draftArtifact.bankLabel : selectedModel?.bankLabel ?? "Banco pendente";
  const referencedProcess = processLabel
    ? processes.find((processItem) => processItem.processNumber === processLabel) ?? null
    : null;
  const processReferenceLabel = referencedProcess?.processNumber ?? processLabel ?? "Pendente";
  const processDetailLabel = referencedProcess
    ? `${referencedProcess.client.fullName} | ${referencedProcess.tribunal} | ${referencedProcess.courtDistrict}`
    : selectedModel
      ? `${selectedModel.clientName} | ${bankLabel}`
      : "Aguardando referencia oficial do processo";
  const clientLabel = draftArtifact?.clientLabel ?? selectedModel?.clientName ?? "Cliente sem referencia";
  const officialSystemHref = "https://pje.tjmg.jus.br/pje/";
  const dataJudHref = referencedProcess ? `/processos/${encodeURIComponent(referencedProcess.id)}/datajud` : "/processos";
  const oabHref = referencedProcess
    ? `/processos/importar-oab?process=${encodeURIComponent(referencedProcess.id)}`
    : "/processos/importar-oab";

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mj-model-title">Handoff de distribuicao</p>
          <p className="mj-model-subtitle">
            A minuta sai do editor e abre os acessos oficiais. Nenhum protocolo automatico e disparado.
          </p>
        </div>
        <Link className="mj-model-button-gray" href="/editor-de-texto/meus-textos">
          Voltar aos textos
        </Link>
      </div>

      <section className="mj-model-panel px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {draftArtifact?.statusLabel ?? "Handoff assistido"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">{clientLabel}</h1>
            <p className="mt-2 text-[13px] leading-6 text-slate-300">
              Caso: {draftArtifact?.caseLabel ?? selectedModel?.caseLabel ?? "Sem caso"} | Processo de referencia:{" "}
              {processReferenceLabel}
            </p>
            <p className="mt-2 text-[13px] leading-6 text-slate-400">{processDetailLabel}</p>
          </div>
          <div className="rounded-[4px] border bg-black/10 px-4 py-3 text-[13px] text-slate-300 mj-model-gridline">
            <p className="font-semibold text-slate-100">Distribuicao manual</p>
            <p className="mt-2 leading-6">
              A superficie oficial nao protocola nada sozinha. Ela apenas concentra os acessos para o ato humano de
              distribuicao e para a leitura posterior do processo.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <a
          className="mj-model-panel px-4 py-4 transition hover:bg-white/[0.04]"
          href={officialSystemHref}
          rel="noreferrer"
          target="_blank"
        >
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">PJe/TJMG</p>
          <p className="mt-2 text-[13px] leading-6 text-slate-200">
            Abrir o portal oficial para a distribuicao manual do caso.
          </p>
          <p className="mt-3 text-[13px] text-slate-400">Link oficial externo</p>
        </a>

        {referencedProcess ? (
          <Link className="mj-model-panel px-4 py-4 transition hover:bg-white/[0.04]" href={dataJudHref}>
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">DataJud</p>
            <p className="mt-2 text-[13px] leading-6 text-slate-200">
              Consultar a origem oficial antes de abrir o processo pos-distribuicao.
            </p>
            <p className="mt-3 text-[13px] text-slate-400">Abrir consulta interna</p>
          </Link>
        ) : (
          <div className="mj-model-panel px-4 py-4">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">DataJud</p>
            <p className="mt-2 text-[13px] leading-6 text-slate-200">
              A referencia oficial do processo ainda nao foi localizada neste workspace.
            </p>
          </div>
        )}

        {referencedProcess ? (
          <Link className="mj-model-panel px-4 py-4 transition hover:bg-white/[0.04]" href={oabHref}>
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">Boundary OAB</p>
            <p className="mt-2 text-[13px] leading-6 text-slate-200">
              Registrar o boundary de acompanhamento depois da distribuicao oficial.
            </p>
            <p className="mt-3 text-[13px] text-slate-400">Abrir boundary</p>
          </Link>
        ) : (
          <div className="mj-model-panel px-4 py-4">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">Boundary OAB</p>
            <p className="mt-2 text-[13px] leading-6 text-slate-200">
              A importacao oficial depende da existencia do processo distribuido.
            </p>
          </div>
        )}
      </section>

      <section className="mj-model-panel px-4 py-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Quando o processo nasce
        </p>
        <p className="mt-3 text-[13px] leading-6 text-slate-300">
          O processo real so e anexado depois da distribuicao manual ou da importacao oficial pelo orgao competente.
          Esta pagina nao simula protocolo e nao representa o detalhe do processo.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="mj-model-gridline rounded-[4px] border px-3 py-3 text-[13px] text-slate-300">
            <p className="font-semibold text-white">Cliente / caso</p>
            <p className="mt-2 text-slate-400">{claraDisplay?.title ?? draftArtifact?.caseLabel ?? clientLabel}</p>
          </div>
          <div className="mj-model-gridline rounded-[4px] border px-3 py-3 text-[13px] text-slate-300">
            <p className="font-semibold text-white">Peca</p>
            <p className="mt-2 text-slate-400">{draftArtifact?.pieceLabel ?? selectedModel?.preview ?? "Minuta em revisao"}</p>
          </div>
          <div className="mj-model-gridline rounded-[4px] border px-3 py-3 text-[13px] text-slate-300">
            <p className="font-semibold text-white">Processo de referencia</p>
            <p className="mt-2 text-slate-400">{processReferenceLabel}</p>
          </div>
        </div>
      </section>

      {claraRecord ? (
        <section className="mj-model-panel px-4 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">Registro da minuta</p>
          <p className="mt-3 text-[13px] leading-6 text-slate-300">
            {claraDisplay?.detail ?? "Registro carregado da Clara para orientar o handoff de distribuicao."}
          </p>
        </section>
      ) : null}

      {!referencedProcess ? (
        <WorkspaceStatePanel
          actionHref="/processos"
          actionLabel="Ver processos"
          description="Nao foi possivel localizar a referencia oficial do processo para esta minuta."
          title="Processo ainda nao anexado"
          tone="warning"
        />
      ) : null}
    </div>
  );
}

function ClaraDraftPanel({
  draftArtifact,
  claraDisplay,
  claraRecord,
  returnPath
}: {
  draftArtifact: Awaited<ReturnType<typeof getClaraTextDraftArtifact>>;
  claraDisplay: ReturnType<typeof getClaraRecordDisplay> | null;
  claraRecord: ClaraRecord | null;
  returnPath: string;
}) {
  const revisionalDraftBlocks = buildRevisionalDraftBlocks(draftArtifact);
  const isDistributionPiece = isDistributionEligiblePiece(draftArtifact.pieceLabel);
  const workflowStatusFormAction = updateClaraWorkflowStatusAction as unknown as string;
  const contentFormAction = updateClaraRecordContentAction as unknown as string;
  const reviewNoteFormAction = updateClaraReviewNoteAction as unknown as string;

  return (
    <section className="mj-model-panel px-4 py-4">
      <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {claraDisplay?.title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
        <span className="rounded-full border px-2 py-1 mj-model-gridline">{draftArtifact.statusLabel}</span>
        <span className="rounded-full border px-2 py-1 mj-model-gridline">{draftArtifact.stageLabel}</span>
        <span className="rounded-full border px-2 py-1 mj-model-gridline">{draftArtifact.recordId}</span>
      </div>
      <p className="mt-3 text-[13px] text-slate-400">
        Tipo de peca: {draftArtifact.pieceLabel} · Caso: {draftArtifact.caseLabel} · Documento base: {draftArtifact.documentLabel}
      </p>
      {claraRecord ? (
        <div className="mt-4 space-y-4 rounded-[4px] border bg-black/10 px-4 py-4 mj-model-gridline">
          <form action={contentFormAction as unknown as string} className="space-y-3">
            <input type="hidden" name="recordId" value={claraRecord.id} />
            <input type="hidden" name="returnPath" value={returnPath} />
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-300">
              Revisao e edicao da minuta
            </p>
            <input
              className="mj-model-input w-full px-3 py-2"
              defaultValue={claraDisplay?.title ?? buildTextDraftDefaultTitle(draftArtifact)}
              name="editedTitle"
              placeholder="Titulo da minuta"
            />
            <textarea
              className="mj-model-input min-h-[20rem] w-full px-3 py-2"
              autoFocus
              defaultValue={claraDisplay?.detail ?? buildTextDraftDefaultBody(draftArtifact)}
              name="editedDetail"
              placeholder="Revise e edite a redacao principal da minuta"
            />
            <button className="mj-model-button-green" type="submit">
              Salvar versao revisada
            </button>
          </form>

          <div className="grid gap-4 lg:grid-cols-2">
            <form action={workflowStatusFormAction as unknown as string} className="space-y-3">
              <input type="hidden" name="recordId" value={claraRecord.id} />
              <input type="hidden" name="returnPath" value={returnPath} />
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                Status documental
              </p>
              <select
                className="mj-model-input w-full px-3 py-2"
                defaultValue={claraRecord.workflowStatus}
                name="workflowStatus"
              >
                <option value="created">Gerado</option>
                <option value="reviewed">Em revisao</option>
                <option value="completed">Aprovado</option>
              </select>
              <button className="mj-model-button-green" type="submit">
                Atualizar status
              </button>
            </form>

            <form action={reviewNoteFormAction as unknown as string} className="space-y-3">
              <input type="hidden" name="recordId" value={claraRecord.id} />
              <input type="hidden" name="returnPath" value={returnPath} />
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                Observacao da revisao humana
              </p>
              <textarea
                className="mj-model-input min-h-[7rem] w-full px-3 py-2"
                defaultValue={claraRecord.reviewNote ?? ""}
                name="reviewNote"
                placeholder="Registrar pendencias, ajustes ou aprovacao final"
              />
              <button className="mj-model-button-gray" type="submit">
                Salvar observacao
              </button>
            </form>
          </div>
        </div>
      ) : null}
      <div className="mt-4 rounded-[4px] border bg-white/[0.03] px-4 py-4 text-[14px] mj-model-gridline">
        <p className="text-slate-200">{claraDisplay?.detail}</p>
        <ul className="mt-3 space-y-1 text-[13px] text-slate-400">
          {draftArtifact.sections.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        {draftArtifact.revisionalMemory ? (
          <div className="mt-4 rounded-[4px] border bg-cyan-300/10 px-4 py-4 mj-model-gridline">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
              Memoria revisional
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-[12px] text-slate-400">Parcela contratada</p>
                <p className="mt-1 text-[13px] font-semibold text-white">
                  {draftArtifact.revisionalMemory.contractedInstallment}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-slate-400">Parcela cobrada</p>
                <p className="mt-1 text-[13px] font-semibold text-white">
                  {draftArtifact.revisionalMemory.chargedInstallment}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-slate-400">Parcela revisada</p>
                <p className="mt-1 text-[13px] font-semibold text-white">
                  {draftArtifact.revisionalMemory.revisedInstallment}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-slate-400">Excesso estimado</p>
                <p className="mt-1 text-[13px] font-semibold text-white">
                  {draftArtifact.revisionalMemory.estimatedTotalExcess}
                </p>
              </div>
            </div>
            <p className="mt-4 text-[13px] text-slate-300">
              Objetivo atual: {draftArtifact.revisionalMemory.objectiveLabel}
            </p>
            {draftArtifact.revisionalMemory.productLabel ? (
              <p className="mt-2 text-[13px] text-slate-300">
                Produto bancario: {draftArtifact.revisionalMemory.productLabel}
              </p>
            ) : null}
            <p className="mt-2 text-[13px] text-slate-300">
              Chave de urgencia: {draftArtifact.revisionalMemory.urgencyLabel}
            </p>
            <p className="mt-4 text-[13px] text-slate-300">
              Tese central: {draftArtifact.revisionalMemory.thesis}
            </p>
            {draftArtifact.revisionalMemory.decisionSummary ? (
              <p className="mt-2 text-[13px] leading-6 text-cyan-50">
                {draftArtifact.revisionalMemory.decisionSummary}
              </p>
            ) : null}
            <ul className="mt-3 space-y-1 text-[13px] text-slate-400">
              {draftArtifact.revisionalMemory.requests.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            {draftArtifact.revisionalMemory.priorityTheses.length ? (
              <div className="mt-4">
                <p className="text-[12px] text-slate-400">Teses priorizadas</p>
                <div className="mt-2 space-y-2">
                  {draftArtifact.revisionalMemory.priorityTheses.map((item) => (
                    <div key={item.title} className="rounded-[4px] border bg-black/10 px-3 py-3 mj-model-gridline">
                      <p className="text-[13px] font-semibold text-slate-100">{item.title}</p>
                      <p className="mt-2 text-[13px] leading-6 text-slate-300">{item.rationale}</p>
                      <p className="mt-2 text-[12px] text-slate-400">Prova-chave: {item.proof}</p>
                      <p className="mt-1 text-[12px] text-slate-400">Pedido conectado: {item.request}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-[12px] text-slate-400">Fundamentos sugeridos</p>
                <ul className="mt-2 space-y-1 text-[13px] text-slate-300">
                  {draftArtifact.revisionalMemory.legalGrounds.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[12px] text-slate-400">Foco probatorio</p>
                <ul className="mt-2 space-y-1 text-[13px] text-slate-300">
                  {draftArtifact.revisionalMemory.evidenceFocus.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            {draftArtifact.revisionalMemory.documentReadiness.length ? (
              <div className="mt-4">
                <p className="text-[12px] text-slate-400">Prontidao documental</p>
                <div className="mt-2 space-y-2">
                  {draftArtifact.revisionalMemory.documentReadiness.map((item) => (
                    <div key={item.title} className="rounded-[4px] border bg-black/10 px-3 py-3 mj-model-gridline">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13px] font-semibold text-slate-100">{item.title}</p>
                        <span className="rounded-[4px] border px-2 py-1 text-[11px] text-slate-300">
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-[13px] leading-6 text-slate-300">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {draftArtifact.revisionalMemory.filingChecklist.length ? (
              <div className="mt-4">
                <p className="text-[12px] text-slate-400">Checklist de ajuizamento</p>
                <div className="mt-2 space-y-2">
                  {draftArtifact.revisionalMemory.filingChecklist.map((item) => (
                    <div key={item.title} className="rounded-[4px] border bg-black/10 px-3 py-3 mj-model-gridline">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13px] font-semibold text-slate-100">{item.title}</p>
                        <span className="rounded-[4px] border px-2 py-1 text-[11px] text-slate-300">
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-[13px] leading-6 text-slate-300">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        {revisionalDraftBlocks ? (
          <div className="mt-4 rounded-[4px] border bg-white/[0.03] px-4 py-4 mj-model-gridline">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Estrutura base da peticao inicial
            </p>
            <div className="mt-4 space-y-4">
              {revisionalDraftBlocks.map((block) => (
                <section key={block.title} className="rounded-[4px] border bg-black/10 px-4 py-4 mj-model-gridline">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                    {block.title}
                  </p>
                  <div className="mt-3 space-y-3 text-[13px] leading-7 text-slate-300">
                    {block.body.map((paragraph) => (
                      <p key={`${block.title}-${paragraph}`}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        ) : null}
        {claraDisplay?.reviewNote ? (
          <p className="mt-3 text-[13px] text-slate-400">Revisao humana: {claraDisplay.reviewNote}</p>
        ) : null}
        {claraRecord ? (
          <ClaraMinutaActions recordId={claraRecord.id} showDistributionAction={isDistributionPiece} />
        ) : null}
      </div>
    </section>
  );
}

function MeusTextosInner({
  draftArtifact,
  claraDisplay,
  claraRecord,
  returnPath,
  textDraftRecords
}: {
  draftArtifact: Awaited<ReturnType<typeof getClaraTextDraftArtifact>> | null;
  claraDisplay: ReturnType<typeof getClaraRecordDisplay> | null;
  claraRecord: ClaraRecord | null;
  returnPath: string;
  textDraftRecords: ClaraTextDraftRecord[];
}) {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="mj-model-title">Meus textos</p>
          <p className="mj-model-subtitle">
            {draftArtifact ? "Minuta aberta para revisao e edicao." : `Exibindo ${textDraftRecords.length} resultado(s)`}
          </p>
        </div>
      </div>

      {draftArtifact ? (
        <ClaraDraftPanel
          claraDisplay={claraDisplay}
          claraRecord={claraRecord?.kind === "text-draft" ? claraRecord : null}
          draftArtifact={draftArtifact}
          returnPath={returnPath}
        />
      ) : null}

      <section className="rounded-[4px] border border-white/5 bg-black/10 px-4 py-4">
        <label className="mb-2 block text-[13px] font-semibold text-slate-300">Busca</label>
        <div className="flex gap-2">
          <input className="mj-model-input w-full px-3 outline-none" placeholder="Termo de busca" type="text" />
          <button className="mj-model-button-gray" type="button">
            Buscar
          </button>
        </div>
      </section>

      {textDraftRecords.length ? (
        <div className="mj-model-panel overflow-hidden">
          {textDraftRecords.map((record, index) => {
            const payload = record.payload as TextDraftPayload;

            return (
              <div
                key={record.id}
                className="grid grid-cols-[1fr_9rem] px-4 py-3 text-[13px]"
                style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}
              >
                <div>
                  <Link
                    className="font-semibold text-slate-100 transition hover:text-cyan-100"
                    href={`/editor-de-texto/meus-textos?record=${encodeURIComponent(record.id)}`}
                  >
                    {payload.caseLabel}
                  </Link>
                  <p className="mt-1 text-slate-400">
                    {payload.pieceLabel} | {payload.documentLabel}
                  </p>
                </div>
                <span className="text-slate-400">
                  {record.workflowStatus === "reviewed"
                    ? "Em revisao"
                    : record.workflowStatus === "completed"
                      ? "Aprovado"
                      : "Gerado"}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mj-model-panel px-4 py-4">
          <p className="mj-model-empty">Nenhum texto da Clara foi registrado ainda.</p>
        </div>
      )}
    </div>
  );
}

function ModelosPage({ textDraftRecords }: { textDraftRecords: ClaraTextDraftRecord[] }) {
  const modelRows = textDraftRecords.map((record) => {
    const payload = record.payload as TextDraftPayload;

    return {
      protocol: record.id,
      name: `${payload.pieceLabel} | ${payload.caseLabel}`
    };
  });

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="mj-model-title">Meus modelos</p>
          <p className="mj-model-subtitle">Exibindo {modelRows.length} resultado(s)</p>
        </div>
        <div className="flex gap-2">
          <button className="mj-model-button-gray" type="button">
            Manual de comandos
          </button>
          <button className="mj-model-button-green" type="button">
            Criar modelo
          </button>
        </div>
      </div>

      {modelRows.length ? (
        <section className="mj-model-panel overflow-hidden">
          <div className="grid grid-cols-[1.8rem_10rem_1fr_8rem] border-b bg-black/10 px-3 py-3 text-[13px] font-semibold text-slate-300 mj-model-gridline">
            <span />
            <span>Registro</span>
            <span>Nome</span>
            <span className="text-right">Opcoes</span>
          </div>

          {modelRows.map((row, index) => (
            <div
              key={row.protocol}
              className="grid grid-cols-[1.8rem_10rem_1fr_8rem] items-center px-3 py-3 text-[13px]"
              style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}
            >
              <input type="checkbox" />
              <span className="truncate text-slate-300">{row.protocol}</span>
              <span className="text-slate-200">{row.name}</span>
              <div className="flex justify-end gap-3 text-slate-300">
                <span>abrir</span>
                <span>copiar</span>
                <span>apagar</span>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="mj-model-panel px-4 py-4">
          <p className="mj-model-empty">Nenhum modelo foi derivado dos textos da Clara ainda.</p>
        </div>
      )}

      <div className="flex justify-end">
        <button className="rounded-[2px] bg-red-500 px-4 py-2 text-[13px] font-semibold text-white" type="button">
          Apagar selecionados
        </button>
      </div>
    </div>
  );
}

export default async function EditorSubpage({
  params,
  searchParams
}: {
  params: { subpage: string };
  searchParams?: {
    draft?: string;
    created?: string;
    niche?: string;
    client?: string;
    record?: string;
    case?: string;
    process?: string;
    document?: string;
    piece?: string;
    objetivo?: string;
    revisedInstallment?: string;
    estimatedTotalExcess?: string;
    chargedInstallment?: string;
    contractedInstallment?: string;
    handoff?: string;
  };
}) {
  const persistedTextDraftRecords = await listClaraMinutas(80);
  const legacyTextDraftRecords = (await listClaraRecords(80)).filter((record) => record.kind === "text-draft");
  const textDraftRecords =
    persistedTextDraftRecords.length > 0
      ? persistedTextDraftRecords
      : (legacyTextDraftRecords as ClaraTextDraftRecord[]);
  const resolvedDraftArtifact = searchParams?.draft
    ? await getClaraTextDraftArtifact({
        caseId: searchParams.case,
        committed: searchParams.created === "1",
        documentId: searchParams.document,
        piece: searchParams.piece,
        objective: searchParams.objetivo,
        revisedInstallment: searchParams.revisedInstallment,
        estimatedTotalExcess: searchParams.estimatedTotalExcess,
        chargedInstallment: searchParams.chargedInstallment,
        contractedInstallment: searchParams.contractedInstallment
      })
    : null;
  const matchedDraftRecord = findExistingDraftRecord(textDraftRecords, resolvedDraftArtifact);
  let claraRecord =
    matchedDraftRecord ??
    (await getClaraMinuta(searchParams?.record ?? "")) ??
    (await getClaraRecord(searchParams?.record));
  if (resolvedDraftArtifact && !claraRecord && searchParams?.draft === "1") {
    const draftCreationTargetPath = buildDraftCreationTargetPath(searchParams);

    if (draftCreationTargetPath) {
      claraRecord = await createClaraRecord({
        kind: "text-draft",
        sourceAction: getDraftSourceAction(resolvedDraftArtifact.pieceLabel),
        targetPath: draftCreationTargetPath,
        clientId: searchParams.client,
        caseId: resolvedDraftArtifact.caseId,
        documentId: resolvedDraftArtifact.documentId,
        processId: searchParams.process,
        piece: resolvedDraftArtifact.pieceLabel,
        objective: searchParams.objetivo
      });
    }
  }
  const currentDraftRecord = claraRecord?.kind === "text-draft" ? (claraRecord as ClaraTextDraftRecord) : null;
  const visibleTextDraftRecords: ClaraTextDraftRecord[] =
    currentDraftRecord && !textDraftRecords.some((record) => record.id === currentDraftRecord.id)
      ? [currentDraftRecord, ...textDraftRecords]
      : textDraftRecords;
  const draftArtifact =
    claraRecord?.kind === "text-draft"
      ? (claraRecord.payload as Awaited<ReturnType<typeof getClaraTextDraftArtifact>>)
      : resolvedDraftArtifact;
  const claraDisplay = draftArtifact
    ? getClaraRecordDisplay(claraRecord, "Rascunho preparado pela Clara", draftArtifact.preview)
    : null;
  const canonicalModels = await buildCanonicalModels(visibleTextDraftRecords);
  const selectedNiche = isBankingNiche(searchParams?.niche) ? searchParams.niche : null;
  const draftReturnPath =
    draftArtifact && claraRecord
      ? buildDraftReturnPath({
          searchParams,
          pieceLabel: draftArtifact.pieceLabel,
          caseId: draftArtifact.caseId,
          documentId: draftArtifact.documentId,
          objective: searchParams?.objetivo,
          niche: selectedNiche
        })
      : buildDraftCreationTargetPath(searchParams);
  const distributionProcesses =
    params.subpage === "distribuicao" ? await getProcesses() : [];

  if (params.subpage === "meus-textos") {
    return (
      <MeusTextosInner
        claraDisplay={claraDisplay}
        claraRecord={claraRecord?.kind === "text-draft" ? claraRecord : null}
        draftArtifact={draftArtifact}
        returnPath={draftReturnPath ?? "/editor-de-texto/meus-textos"}
        textDraftRecords={visibleTextDraftRecords}
      />
    );
  }

  if (params.subpage === "modelos") {
    return <ModelosPage textDraftRecords={textDraftRecords} />;
  }

  if (params.subpage === "distribuicao") {
    return (
      <DistributionPage
        claraDisplay={claraDisplay}
        claraRecord={claraRecord}
        draftArtifact={draftArtifact}
        models={canonicalModels}
        selectedNiche={selectedNiche}
        processes={distributionProcesses}
      />
    );
  }

  notFound();
}
