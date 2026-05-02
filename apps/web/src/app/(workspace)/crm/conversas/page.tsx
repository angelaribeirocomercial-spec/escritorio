import Link from "next/link";

import { WorkspaceStatePanel } from "@lexia/ui";

import { WorkspacePage } from "@/components/layout/workspace-page";
import { getCrmConversations } from "@/server/services/crm/get-crm-conversations";

export default async function CrmConversationsPage() {
  let conversations: Awaited<ReturnType<typeof getCrmConversations>> = [];

  try {
    conversations = await getCrmConversations();
  } catch {
    return (
      <WorkspaceStatePanel
        actionHref="/crm"
        actionLabel="Voltar ao CRM"
        description="Nao foi possivel carregar conversas reais a partir da carteira ativa."
        title="Conversas do CRM indisponiveis"
        tone="danger"
      />
    );
  }

  return (
    <WorkspacePage
      description="Conversas reais derivadas do historico da carteira e do estado atual de cada cliente."
      eyebrow="CRM"
      metrics={[
        { label: "Conversas", value: String(conversations.length) },
        { label: "Com caso", value: String(conversations.filter((conversation) => conversation.caseId).length) },
        { label: "Sem caso", value: String(conversations.filter((conversation) => !conversation.caseId).length) },
        { label: "Foco atual", value: "Historico e follow-up" }
      ]}
      title="Conversas do escritorio"
    >
      <section className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Historico de contato</p>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
          O CRM expõe o historico de conversa como trilha operacional, conectando contato comercial, contrato e caso
          quando isso ja existe na carteira real.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {conversations.map((conversation) => (
          <article key={conversation.id} className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{conversation.clientName}</p>
                <p className="mt-1 text-sm text-slate-400">{conversation.summary}</p>
              </div>
              <span className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-200">
                {conversation.statusLabel}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">{conversation.lastMessage}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{conversation.nextAction}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                href={`/pessoas/clientes/${conversation.clientId}`}
              >
                Abrir cliente
              </Link>
              {conversation.caseId ? (
                <Link
                  className="rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200"
                  href={`/casos/${conversation.caseId}`}
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
