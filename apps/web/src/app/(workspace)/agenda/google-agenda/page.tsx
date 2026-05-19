import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import { WorkspacePage } from "@/components/layout/workspace-page";

export default function AgendaGoogleAgendaPage() {
  return (
    <WorkspacePage
      description="Estado real da conexao entre a agenda operacional do workspace e o Google Agenda. Esta superficie nao inicia OAuth nem sincronizacao ficticia enquanto o backend dessa integracao nao existir."
      eyebrow="Agenda"
      metrics={[
        { label: "Provider", value: "Google Agenda" },
        { label: "Status", value: "Nao conectado" },
        { label: "OAuth", value: "Nao implementado" },
        { label: "Sincronizacao", value: "Indisponivel" }
      ]}
      title="Google Agenda"
    >
      <WorkspaceStatePanel
        description="O produto ainda nao possui contrato server-side para autorizar contas Google, salvar tokens por tenant ou sincronizar compromissos com auditoria. Por isso, esta tela assume o estado real: a integracao ainda nao esta disponivel nesta area do workspace."
        title="Integracao ainda nao disponivel"
        tone="warning"
      />

      <section className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/80">
          O que esta pronto hoje
        </p>
        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
          <p>A agenda operacional do workspace continua funcionando com os compromissos persistidos internamente.</p>
          <p>As integracoes oficiais da Clara continuam separadas desta superficie e cobrem fontes publicas e juridicas, nao calendarios externos.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <Link className="detail-link-button px-3 py-2" href="/configuracoes/integracoes">
            Ver integracoes oficiais da Clara
          </Link>
        </div>
      </section>
    </WorkspacePage>
  );
}
