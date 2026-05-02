import { notFound } from "next/navigation";

import {
  getClaraRecord,
  getClaraRecordDisplay,
  listClaraRecords,
  type ClaraRecord
} from "@/server/services/clara/clara-record-store";
import { getClaraTextDraftArtifact } from "@/server/services/clara/get-clara-artifacts";
import {
  updateClaraReviewNoteAction,
  updateClaraWorkflowStatusAction
} from "@/app/(workspace)/clara/actions";
import { ClaraMinutaActions } from "@/components/layout/clara-minuta-actions";

type RevisionalDraftBlock = {
  title: string;
  body: string[];
};

type TextDraftPayload = Awaited<ReturnType<typeof getClaraTextDraftArtifact>>;

function buildRevisionalDraftBlocks(
  draftArtifact: Awaited<ReturnType<typeof getClaraTextDraftArtifact>>
): RevisionalDraftBlock[] | null {
  if (!draftArtifact.revisionalMemory) {
    return null;
  }

  const processNumber = draftArtifact.processLabel;
  const bankName = draftArtifact.bankLabel;
  const scenarioLabel = draftArtifact.revisionalMemory.scenarioLabel;
  const objectiveLabel = draftArtifact.revisionalMemory.objectiveLabel;
  const urgencyLabel = draftArtifact.revisionalMemory.urgencyLabel;
  const isCcbScenario = scenarioLabel.toLowerCase().includes("ccb");
  const hasNegativationUrgency = urgencyLabel.toLowerCase().includes("negativacao");
  const isCalculationObjective = objectiveLabel === "Montar memoria de calculo";
  const isFullActionObjective = objectiveLabel === "Preparar acao revisional";
  const priorityThesisTitles = draftArtifact.revisionalMemory.priorityTheses.map((item) => item.title);

  return [
    {
      title: "Dos fatos",
      body: [
        `Trata-se de minuta inicial para acao revisional de contrato bancario vinculada ao caso "${draftArtifact.caseLabel}", relacionada ao documento-base "${draftArtifact.documentLabel}" e ao processo de referencia ${processNumber}.`,
        hasNegativationUrgency
          ? "A parte autora relata agravamento progressivo do custo contratual, acompanhado de pressao concreta de restricao crediticia, o que torna imediata a intervencao judicial para impedir dano continuado."
          : `A parte autora relata agravamento progressivo do custo contratual, com cobranca acima do patamar inicialmente compreendido e impacto direto sobre sua capacidade de adimplemento regular.`
      ]
    },
    {
      title: "Da relacao contratual",
      body: [
        isCcbScenario
          ? `A relacao juridica mantida com ${bankName} decorre de operacao bancaria formalizada em ccb, exigindo controle judicial sobre a engenharia financeira do titulo, a transparencia do custo efetivo e o equilibrio material da cobranca.`
          : `A relacao juridica mantida com ${bankName} esta submetida ao regime protetivo do consumidor, impondo controle de transparencia, boa-fe objetiva e equilibrio material das clausulas remuneratorias e acessorias.`,
        `A leitura juridico-economica consolidada pela Clara aponta como tese central a ${draftArtifact.revisionalMemory.thesis.toLowerCase()}, diante de cobranca superior ao patamar contratualmente esperado e de clausulas com potencial de abusividade frente ao consumidor.`,
        `O enquadramento atual do caso foi tratado como ${draftArtifact.revisionalMemory.scenarioLabel.toLowerCase()}, com objetivo operacional de ${draftArtifact.revisionalMemory.objectiveLabel.toLowerCase()} e ${draftArtifact.revisionalMemory.urgencyLabel.toLowerCase()}, o que orienta a selecao dos fundamentos e dos pedidos revisionais prioritarios.`
      ]
    },
    {
      title: "Das abusividades identificadas",
      body: [
        `A narrativa revisional deve destacar a incidencia de encargos potencialmente excessivos, capitalizacao e composicao financeira aptas a produzir desequilibrio contratual e onerosidade excessiva.`,
        `No estado atual da leitura, a Clara sugere sustentar especialmente: ${draftArtifact.revisionalMemory.legalGrounds.join("; ")}.`,
        priorityThesisTitles.length
          ? `Como linha mestra da inicial, recomenda-se abrir a fundamentacao com ${priorityThesisTitles.join("; ")}, em ordem de prioridade compativel com a prova ja indicada.`
          : "A ordem final das teses deve seguir a combinacao entre abusividade contratual, memoria economica e urgencia comprovada."
      ]
    },
    {
      title: "Da memoria de calculo revisional",
      body: [
        `No plano economico inicial, a parcela contratada foi identificada em ${draftArtifact.revisionalMemory.contractedInstallment}, ao passo que a parcela atualmente exigida alcanca ${draftArtifact.revisionalMemory.chargedInstallment}.`,
        isCalculationObjective
          ? `Como o objetivo central do fluxo e consolidar a memoria de calculo, a narrativa deve privilegiar o comparativo economico entre parcela revisada em ${draftArtifact.revisionalMemory.revisedInstallment} e excesso estimado de ${draftArtifact.revisionalMemory.estimatedTotalExcess}, com indicacao clara da metodologia de recalcule.`
          : `Pela memoria revisional preliminar, a parcela readequada seria de ${draftArtifact.revisionalMemory.revisedInstallment}, com excesso estimado de ${draftArtifact.revisionalMemory.estimatedTotalExcess}, sujeito a refinamento por pericia ou planilha detalhada.`,
        `Para sustentar essa frente, a Clara considera como prova critica: ${draftArtifact.revisionalMemory.evidenceFocus.join("; ")}.`
      ]
    },
    {
      title: "Da tutela de urgencia",
      body: [
        hasNegativationUrgency
          ? "A tutela de urgencia deve priorizar a suspensao imediata da negativacao ou da ameaca de restricao, demonstrando que a manutencao da medida gera dano operacional e reputacional superior ao risco processual da reversibilidade."
          : `A depender da prova documental final, a minuta comporta pedido de tutela para conter cobranca excessiva, impedir agravamento do debito e resguardar a parte autora contra medidas restritivas enquanto se discute a legalidade das clausulas.`,
        isFullActionObjective
          ? "Como o objetivo operacional atual e preparar a acao revisional completa, a urgencia deve ser apresentada como instrumento de estabilizacao contratual desde o ajuizamento, inclusive para autorizar pagamento do valor incontroverso."
          : `O fundamento de urgencia deve ser construido sobre o risco de dano financeiro continuado e sobre a plausibilidade tecnica da revisao ja indicada pela leitura contratual preliminar.`
      ]
    },
    {
      title: "Dos pedidos",
      body: [
        `Em sede de pedidos, a minuta ja considera como eixo revisional: ${draftArtifact.revisionalMemory.requests.join("; ")}.`,
        isFullActionObjective
          ? "A versao final deve individualizar pedidos principais, tutela, pedidos sucessivos e repeticao de indebito de modo articulado, ja em formato de inicial pronta para protocolo."
          : "A versao final ainda deve individualizar provas, definir pedidos sucessivos e ajustar a estrategia de repeticao de indebito, compensacao e encargos conforme a documentacao completa do contrato."
      ]
    }
  ];
}

function ClaraDraftPanel({
  draftArtifact,
  claraDisplay,
  claraRecord
}: {
  draftArtifact: Awaited<ReturnType<typeof getClaraTextDraftArtifact>>;
  claraDisplay: ReturnType<typeof getClaraRecordDisplay> | null;
  claraRecord: ClaraRecord | null;
}) {
  const revisionalDraftBlocks = buildRevisionalDraftBlocks(draftArtifact);
  const workflowStatusFormAction = updateClaraWorkflowStatusAction as unknown as string;
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
          <div className="mt-4 grid gap-4 rounded-[4px] border bg-black/10 px-4 py-4 mj-model-gridline lg:grid-cols-2">
            <form action={workflowStatusFormAction as unknown as string} className="space-y-3">
              <input type="hidden" name="recordId" value={claraRecord.id} />
              <input type="hidden" name="returnPath" value="/editor-de-texto/meus-textos" />
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                Status documental
              </p>
              <select
                className="mj-model-input w-full px-3 py-2"
                defaultValue={claraRecord.workflowStatus}
                name="workflowStatus"
              >
                <option value="created">created</option>
                <option value="reviewed">reviewed</option>
                <option value="completed">completed</option>
              </select>
              <button className="mj-model-button-green" type="submit">
                Atualizar status
              </button>
            </form>

            <form action={reviewNoteFormAction as unknown as string} className="space-y-3">
              <input type="hidden" name="recordId" value={claraRecord.id} />
              <input type="hidden" name="returnPath" value="/editor-de-texto/meus-textos" />
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
        ) : null}
        {claraRecord ? <ClaraMinutaActions recordId={claraRecord.id} /> : null}
      </div>
    </section>
  );
}

function MeusTextosInner({
  draftArtifact,
  claraDisplay,
  claraRecord,
  textDraftRecords
}: {
  draftArtifact: Awaited<ReturnType<typeof getClaraTextDraftArtifact>> | null;
  claraDisplay: ReturnType<typeof getClaraRecordDisplay> | null;
  claraRecord: ClaraRecord | null;
  textDraftRecords: ClaraRecord[];
}) {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="mj-model-title">Meus textos</p>
          <p className="mj-model-subtitle">Exibindo {textDraftRecords.length} resultado(s)</p>
        </div>
        <button className="mj-model-button-green" type="button">
          Criar texto v
        </button>
      </div>

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
                  <p className="font-semibold text-slate-100">{payload.caseLabel}</p>
                  <p className="mt-1 text-slate-400">
                    {payload.pieceLabel} | {payload.documentLabel}
                  </p>
                </div>
                <span className="text-slate-400">{record.workflowStatus}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mj-model-panel px-4 py-4">
          <p className="mj-model-empty">Nenhum texto da Clara foi registrado ainda.</p>
        </div>
      )}

      {draftArtifact ? (
        <ClaraDraftPanel
          claraDisplay={claraDisplay}
          claraRecord={claraRecord?.kind === "text-draft" ? claraRecord : null}
          draftArtifact={draftArtifact}
        />
      ) : null}
    </div>
  );
}

function ModelosPage({ textDraftRecords }: { textDraftRecords: ClaraRecord[] }) {
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
    record?: string;
    case?: string;
    document?: string;
    piece?: string;
    objetivo?: string;
    revisedInstallment?: string;
    estimatedTotalExcess?: string;
    chargedInstallment?: string;
    contractedInstallment?: string;
  };
}) {
  const textDraftRecords = (await listClaraRecords(80)).filter((record) => record.kind === "text-draft");
  const claraRecord = await getClaraRecord(searchParams?.record);
  const draftArtifact =
    claraRecord?.kind === "text-draft"
      ? (claraRecord.payload as Awaited<ReturnType<typeof getClaraTextDraftArtifact>>)
      : searchParams?.draft
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
  const claraDisplay = draftArtifact
    ? getClaraRecordDisplay(claraRecord, "Rascunho preparado pela Clara", draftArtifact.preview)
    : null;

  if (params.subpage === "meus-textos") {
    return (
      <MeusTextosInner
        claraDisplay={claraDisplay}
        claraRecord={claraRecord?.kind === "text-draft" ? claraRecord : null}
        draftArtifact={draftArtifact}
        textDraftRecords={textDraftRecords}
      />
    );
  }

  if (params.subpage === "modelos") {
    return <ModelosPage textDraftRecords={textDraftRecords} />;
  }

  notFound();
}
