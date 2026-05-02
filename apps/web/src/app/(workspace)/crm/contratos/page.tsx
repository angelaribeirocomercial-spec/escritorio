import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import { WorkspacePage } from "@/components/layout/workspace-page";
import { getCrmContracts } from "@/server/services/crm/get-crm-contracts";

export default async function CrmContractsPage() {
  let contracts: Awaited<ReturnType<typeof getCrmContracts>> = [];

  try {
    contracts = await getCrmContracts();
  } catch {
    return (
      <WorkspaceStatePanel
        actionHref="/crm"
        actionLabel="Voltar ao CRM"
        description="Nao foi possivel carregar contratos reais a partir da carteira ativa."
        title="Contratos do CRM indisponiveis"
        tone="danger"
      />
    );
  }

  return (
    <WorkspacePage
      description="Contratos reais conectados aos clientes convertidos e aos casos ja abertos no workspace."
      eyebrow="CRM"
      metrics={[
        { label: "Contratos", value: String(contracts.length) },
        { label: "Clientes", value: String(new Set(contracts.map((contract) => contract.clientId)).size) },
        { label: "Casos", value: String(contracts.filter((contract) => contract.caseId).length) },
        { label: "Foco atual", value: "Contrato e transicao" }
      ]}
      title="Contratos do escritorio"
    >
      <section className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Transicao juridica</p>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
          O CRM agora mostra quais clientes ja formalizaram contrato e quais ainda precisam de vinculo completo com o
          caso. Isso fecha a parte comercial da fase 4 sem depender de dados ficticios.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {contracts.map((contract) => (
          <article key={contract.id} className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{contract.clientName}</p>
                <p className="mt-1 text-sm text-slate-400">{contract.bankName}</p>
              </div>
              <span className="rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                {contract.statusLabel}
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contrato</p>
                <p className="mt-2">{contract.contractNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Caso</p>
                <p className="mt-2">{contract.caseId ?? "Ainda nao vinculado"}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">{contract.detail}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{contract.nextAction}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                href={`/pessoas/clientes/${contract.clientId}`}
              >
                Abrir cliente
              </Link>
              {contract.caseId ? (
                <Link
                  className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                  href={`/casos/${contract.caseId}`}
                >
                  Abrir caso
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </WorkspacePage>
  );
}
