import Link from "next/link";

import { WorkspacePage } from "@/components/layout/workspace-page";

const operationActions = [
  {
    label: "Agenda",
    href: "/agenda/compromissos",
    detail: "Compromissos operacionais e leitura diaria do que precisa acontecer."
  },
  {
    label: "Tarefas",
    href: "/agenda/tarefas",
    detail: "Fila de execucao ativa para destravar prazos, clientes e processos."
  },
  {
    label: "Prazos",
    href: "/agenda/prazos",
    detail: "Controle das janelas criticas do escritorio sem trocar de modulo."
  },
  {
    label: "Publicacoes",
    href: "/diario-oficial/publicacoes",
    detail: "Eventos oficiais que alimentam triagem, prazo e proxima medida."
  },
  {
    label: "Monitoramento",
    href: "/processos/monitoramentos",
    detail: "Andamentos processuais recentes e sinais que mudam prioridade."
  }
] as const;

export default function OperacaoPage() {
  return (
    <WorkspacePage
      description="Operacao unifica agenda, publicacoes, monitoramento, tarefas e prazos como a fila pratica do escritorio."
      eyebrow="Operacao"
      metrics={[
        { label: "Foco", value: "Fila diaria" },
        { label: "Compatibilidade", value: "Rotas atuais" },
        { label: "Slice", value: "Navegacao" },
        { label: "Estado", value: "Ativo" }
      ]}
      title="Fila operacional do escritorio"
    >
      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {operationActions.map((item) => (
          <Link
            key={item.href}
            className="workspace-soft-card flex h-full flex-col justify-between rounded-[4px] border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.07]"
            href={item.href}
          >
            <div>
              <p className="text-lg font-semibold text-white">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
            </div>
            <span className="mt-4 inline-flex w-fit rounded-[4px] border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              Abrir area
            </span>
          </Link>
        ))}
      </section>
    </WorkspacePage>
  );
}
