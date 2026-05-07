import Link from "next/link";

import { WorkspacePage } from "@/components/layout/workspace-page";
import { getContractAnalysisWorkspace } from "@/server/services/contract-analysis/get-contract-analysis";

function proceduralRiskLabel(risk: string) {
  switch (risk) {
    case "low":
      return "Risco processual baixo";
    case "medium":
      return "Risco processual medio";
    default:
      return "Risco processual alto";
  }
}

const dossierTabs = [
  { label: "Visao geral", href: "#resumo" },
  { label: "BACEN", href: "#bacen" },
  { label: "Abusividades", href: "#abusividades" },
  { label: "Estrategia", href: "#estrategia" },
  { label: "Laudo", href: "#laudo" },
  { label: "Pecas", href: "#pecas" }
] as const;

function severityLabel(severity: "low" | "medium" | "high") {
  switch (severity) {
    case "low":
      return "Baixa";
    case "medium":
      return "Media";
    default:
      return "Alta";
  }
}

export default async function ContractAnalysisPage({
  searchParams
}: {
  searchParams?: {
    documentId?: string;
    financedAmount?: string;
    installmentCount?: string;
    contractedInstallment?: string;
    chargedInstallment?: string;
    targetReductionPercent?: string;
  };
}) {
  const workspace = await getContractAnalysisWorkspace(searchParams?.documentId, {
    financedAmount: searchParams?.financedAmount,
    installmentCount: searchParams?.installmentCount,
    contractedInstallment: searchParams?.contractedInstallment,
    chargedInstallment: searchParams?.chargedInstallment,
    targetReductionPercent: searchParams?.targetReductionPercent
  });

  const metrics = [
    { label: "Contrato Selecionado", value: workspace.selectedDocument.documentType },
    { label: "Cliente", value: workspace.client.fullName },
    { label: "Caso", value: workspace.bankingCase.id },
    { label: "Risco", value: proceduralRiskLabel(workspace.analysis.proceduralRisk) }
  ];

  return (
    <WorkspacePage
      description="Tela flagship de leitura contratual da Clara, com abusividade, tese sugerida, risco e pedidos estruturados para Direito Bancario."
      eyebrow="Analise de Contrato"
      metrics={metrics}
      title="Console premium de analise contratual bancaria"
    >
      <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,20,35,0.92),rgba(14,24,42,0.82))] p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          {dossierTabs.map((tab) => (
            <Link
              key={tab.href}
              className="rounded-[16px] border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-50"
              href={tab.href}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </section>

      <section id="resumo" className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,20,35,0.94),rgba(14,24,42,0.84))] p-6 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Contrato em foco</p>
            <p className="mt-1 text-sm font-medium text-slate-400">
              Selecione o contrato para alternar a leitura juridica premium da Clara.
            </p>
          </div>
          <form className="flex flex-wrap gap-3" method="get">
            <select
              className="min-w-80 rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
              defaultValue={workspace.selectedDocument.id}
              name="documentId"
            >
              {workspace.contractDocuments.map((document) => (
                <option key={document.id} value={document.id}>
                  {document.documentType} · {document.label}
                </option>
              ))}
            </select>
            <button
              className="rounded-[18px] bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-soft"
              type="submit"
            >
              Analisar
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <article className="rounded-[30px] border border-cyan-300/15 bg-[linear-gradient(145deg,rgba(8,18,32,0.98),rgba(15,29,54,0.92)_58%,rgba(8,83,96,0.44))] p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Resumo executivo</p>
              <p className="mt-1 text-sm font-medium text-slate-300">
                {workspace.selectedDocument.fileName} · {workspace.client.fullName}
              </p>
            </div>
            <Link
              className="rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-slate-200 shadow-soft"
              href={`/documentos/${workspace.selectedDocument.id}`}
            >
              Ver documento
            </Link>
          </div>

          <div className="mt-5 rounded-[28px] border border-white/10 bg-black/20 p-6 text-slate-100">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100">
              Conclusao principal
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              {workspace.analysis.executiveSummary}
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Cenario revisional
            </p>
            <p className="mt-2 text-sm font-semibold text-amber-200">{workspace.scenarioProfile.label}</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{workspace.scenarioProfile.summary}</p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Taxa de juros
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{workspace.analysis.rateLabel}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                CET
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{workspace.analysis.cetLabel}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Capitalizacao
              </p>
              <p className="mt-2 text-sm text-slate-300">{workspace.analysis.capitalizationLabel}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Tarifas
              </p>
              <p className="mt-2 text-sm text-slate-300">{workspace.analysis.feesLabel}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Seguro embutido
              </p>
              <p className="mt-2 text-sm text-slate-300">{workspace.analysis.bundledInsuranceLabel}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Comissao de permanencia
              </p>
              <p className="mt-2 text-sm text-slate-300">{workspace.analysis.permanenceCommissionLabel}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Multa e encargos
              </p>
              <p className="mt-2 text-sm text-slate-300">{workspace.analysis.penaltyLabel}</p>
            </div>
          </div>
        </article>

        <article className="rounded-[30px] border border-fuchsia-300/15 bg-[linear-gradient(180deg,rgba(25,13,38,0.92),rgba(46,16,54,0.74))] p-6 shadow-soft">
          <p className="text-sm font-semibold text-white">Tese, risco e pedidos</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Tese sugerida
              </p>
              <p className="mt-3 text-sm font-semibold text-white">{workspace.analysis.suggestedThesis}</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Risco processual
              </p>
              <p className="mt-3 text-sm font-semibold text-white">
                {proceduralRiskLabel(workspace.analysis.proceduralRisk)}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Pedidos sugeridos
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                {workspace.analysis.suggestedRequests.map((request) => (
                  <li key={request}>{request}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </section>

      <section id="bacen" className="rounded-[30px] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(8,18,32,0.95),rgba(10,34,50,0.82))] p-6 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">BACEN</p>
            <p className="mt-1 text-sm text-slate-300">{workspace.bacenComparison.summary}</p>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-cyan-100">
            {workspace.bacenComparison.classificationLabel}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Taxa contratual</p>
            <p className="mt-2 text-sm font-semibold text-white">{workspace.bacenComparison.contractRateLabel}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Taxa BACEN</p>
            <p className="mt-2 text-sm font-semibold text-white">{workspace.bacenComparison.marketReferenceLabel}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Modalidade</p>
            <p className="mt-2 text-sm font-semibold text-white">{workspace.bacenComparison.modalityLabel}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Periodo consultado</p>
            <p className="mt-2 text-sm font-semibold text-white">{workspace.bacenComparison.consultedPeriodLabel}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Diferenca percentual</p>
            <p className="mt-2 text-sm font-semibold text-white">{workspace.bacenComparison.differencePercentLabel}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Leitura operacional</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{workspace.bacenComparison.summary}</p>
          </div>
        </div>
      </section>

      <section id="abusividades" className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,20,35,0.94),rgba(14,24,42,0.84))] p-6 shadow-soft">
          <p className="text-sm font-semibold text-white">Clausulas sensiveis</p>
          <div className="mt-5 space-y-3">
            {workspace.analysis.sensitiveClauses.map((clause) => (
              <div
                key={clause}
                className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-6 text-slate-300"
              >
                {clause}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[30px] border border-amber-300/15 bg-[linear-gradient(180deg,rgba(52,31,6,0.78),rgba(74,40,8,0.56))] p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Inventario de abusividades</p>
              <p className="mt-1 text-sm text-amber-100/80">
                Sinais persistidos e prontos para estrategia, laudo e peticao.
              </p>
            </div>
            <div className="rounded-[18px] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
              {workspace.detectedAbuses.length} itens
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {workspace.detectedAbuses.map((abuse) => (
              <div
                key={abuse.id}
                className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm leading-6 text-amber-100"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-white">{abuse.signalLabel}</p>
                  <span className="rounded-full border border-amber-200/30 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">
                    Gravidade {severityLabel(abuse.severity)}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/70">
                      Dado usado
                    </p>
                    <p className="mt-2 text-sm text-amber-50">{abuse.evidenceLabel}</p>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/70">
                      Impacto financeiro
                    </p>
                    <p className="mt-2 text-sm text-amber-50">{abuse.financialImpactLabel}</p>
                  </div>
                </div>
                <div className="mt-3 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/70">
                    Sugestao juridica
                  </p>
                  <p className="mt-2 text-sm text-amber-50">{abuse.legalSuggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section id="estrategia" className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,20,35,0.94),rgba(14,24,42,0.84))] p-6 shadow-soft">
          <p className="text-sm font-semibold text-white">Contexto do caso</p>
          <div className="mt-5 rounded-[28px] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-slate-300">
            <p>
              Cliente relacionado: <span className="font-semibold text-white">{workspace.client.fullName}</span>
            </p>
            <p className="mt-3">
              Caso vinculado: <span className="font-semibold text-white">{workspace.bankingCase.title}</span>
            </p>
            <p className="mt-3">Estrategia atual: {workspace.bankingCase.suggestedStrategy}</p>
          </div>
        </article>

        <article className="rounded-[30px] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(9,21,36,0.96),rgba(10,38,53,0.78))] p-6 shadow-soft">
          <p className="text-sm font-semibold text-white">Proximas acoes recomendadas</p>
          <div className="mt-5 grid gap-3">
            {[
              "Gerar tese resumida para o caso",
              "Abrir tarefa de revisao contratual",
              "Montar estrutura da peticao inicial",
              "Produzir atualizacao ao cliente"
            ].map((action) => (
              <button
                key={action}
                className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-sm font-semibold text-slate-100"
                type="button"
              >
                {action}
              </button>
            ))}
          </div>
          <p className="mt-5 text-xs font-medium leading-5 text-slate-300">
            A analise e assistida e deve ser conferida pelo advogado responsavel antes de qualquer uso processual.
          </p>
        </article>
      </section>

      <section id="laudo" className="grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
        <article className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,20,35,0.94),rgba(14,24,42,0.84))] p-6 shadow-soft">
          <p className="text-sm font-semibold text-white">Checklist minimo da revisional</p>
          <div className="mt-5 space-y-3">
            {workspace.revisionalChecklist.map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-6 text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[30px] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(9,21,36,0.96),rgba(10,38,53,0.78))] p-6 shadow-soft">
          <p className="text-sm font-semibold text-white">Estrutura base da acao revisional</p>
          <div className="mt-5 space-y-3">
            {workspace.revisionalStructure.map((item, index) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Bloco {index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,20,35,0.94),rgba(14,24,42,0.84))] p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Memoria de calculo revisional</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Comparativo economico inicial para sustentar rediscussao de clausulas e readequacao das parcelas.
            </p>
          </div>
          <Link
            className="rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-slate-200 shadow-soft"
            href={`/clara?tab=revisional&document=${workspace.selectedDocument.id}&client=${workspace.client.id}&financedAmount=${encodeURIComponent(workspace.calculationMemory.labels.financedAmount)}&installmentCount=${workspace.calculationMemory.inputs.installmentCount}&contractedInstallment=${encodeURIComponent(workspace.calculationMemory.labels.contractedInstallment)}&chargedInstallment=${encodeURIComponent(workspace.calculationMemory.labels.chargedInstallment)}&targetReductionPercent=${workspace.calculationMemory.inputs.targetReductionPercent}`}
          >
            Abrir na Clara revisional
          </Link>
        </div>

        <form className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5" method="get">
          <input name="documentId" type="hidden" value={workspace.selectedDocument.id} />
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Valor financiado
            </label>
            <input
              className="w-full rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
              defaultValue={workspace.calculationMemory.labels.financedAmount}
              name="financedAmount"
              type="text"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Parcelas
            </label>
            <input
              className="w-full rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
              defaultValue={workspace.calculationMemory.inputs.installmentCount}
              name="installmentCount"
              type="number"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Parcela contratada
            </label>
            <input
              className="w-full rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
              defaultValue={workspace.calculationMemory.labels.contractedInstallment}
              name="contractedInstallment"
              type="text"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Parcela cobrada
            </label>
            <input
              className="w-full rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
              defaultValue={workspace.calculationMemory.labels.chargedInstallment}
              name="chargedInstallment"
              type="text"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Reducao alvo (%)
            </label>
            <input
              className="w-full rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
              defaultValue={workspace.calculationMemory.inputs.targetReductionPercent}
              name="targetReductionPercent"
              step="0.1"
              type="number"
            />
          </div>
          <button
            className="rounded-[18px] bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-soft xl:col-span-5"
            type="submit"
          >
            Recalcular memoria de calculo
          </button>
        </form>

        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {[
            {
              label: "Parcela contratada",
              value: workspace.calculationMemory.labels.contractedInstallment
            },
            {
              label: "Parcela cobrada",
              value: workspace.calculationMemory.labels.chargedInstallment
            },
            {
              label: "Parcela revisada",
              value: workspace.calculationMemory.labels.revisedInstallment
            },
            {
              label: "Excesso mensal",
              value: workspace.calculationMemory.labels.estimatedMonthlyExcess
            },
            {
              label: "Excesso estimado",
              value: workspace.calculationMemory.labels.estimatedTotalExcess
            }
          ].map((item) => (
            <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {item.label}
              </p>
              <p className="mt-3 text-sm font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[24px] border border-cyan-300/15 bg-cyan-300/10 px-4 py-4">
          <p className="text-sm leading-6 text-cyan-100">{workspace.calculationMemory.basis}</p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {workspace.calculationMemory.highlights.map((item) => (
            <div
              key={item}
              className="rounded-[22px] border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm leading-6 text-amber-100"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="pecas" className="grid gap-4 xl:grid-cols-[0.98fr_1.02fr]">
        <article className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,20,35,0.94),rgba(14,24,42,0.84))] p-6 shadow-soft">
          <p className="text-sm font-semibold text-white">Fundamentos juridicos sugeridos</p>
          <div className="mt-5 space-y-3">
            {workspace.thesisFrames.map((item) => (
              <div key={item.title} className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[30px] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(9,21,36,0.96),rgba(10,38,53,0.78))] p-6 shadow-soft">
          <p className="text-sm font-semibold text-white">Pedidos e trilha probatoria</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              {workspace.revisionalRequests.map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm leading-6 text-amber-100"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {workspace.proofStrategy.map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-6 text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </WorkspacePage>
  );
}
