"use client";

import { usePathname } from "next/navigation";

export function WorkspaceHeaderNarrative() {
  const pathname = usePathname();

  if (!pathname.startsWith("/crm")) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Narrativa do produto
        </p>
        <p className="mt-1 leading-6 text-slate-200">
          CRM juridico, carteira bancaria, GED inteligente, tarefas operacionais e analise contratual premium com a Clara como camada central de inteligencia.
        </p>
      </div>

      <div className="rounded-full border border-cyan-300/10 bg-cyan-300/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
        Menos admin. Mais comando.
      </div>
    </div>
  );
}
