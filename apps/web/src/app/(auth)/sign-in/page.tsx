import { redirect } from "next/navigation";

import { SignInForm } from "@/app/(auth)/sign-in/sign-in-form";
import { getDemoClaraFirstHref } from "@/lib/auth/demo-entry";
import { getWorkspaceSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function SignInPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const session = await getWorkspaceSession();

  if (session) {
    redirect(getDemoClaraFirstHref());
  }

  const configured = isSupabaseConfigured();

  return (
    <main className="sign-in-page min-h-screen bg-background bg-lexia-glow px-6 py-16 text-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="sign-in-hero-shell rounded-[36px] border border-white/10 bg-[linear-gradient(145deg,rgba(9,18,34,0.96),rgba(12,23,40,0.88)_58%,rgba(8,65,86,0.4))] p-8 shadow-soft backdrop-blur">
          <p className="sign-in-eyebrow sign-in-brand text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-700">
            ADVX
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Comece gratis e abra a Clara no fluxo real do direito bancario.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-300">
            Entre para ver um sistema moderno, simples de usar e automatizado. A Clara global abre como assistente do sistema, enquanto o dossie continua concentrando a leitura contextual de cada caso.
          </p>

          {!configured ? (
            <div className="sign-in-warning-box mt-6 rounded-[22px] border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm text-amber-100">
              Configure <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> para autenticar com o seu projeto Supabase real.
            </div>
          ) : null}

          <div className="mt-8 max-w-md">
            <SignInForm error={searchParams?.error} supabaseConfigured={configured} />
          </div>
        </section>

        <aside className="sign-in-security-shell rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,17,40,0.98),rgba(8,13,31,0.95))] p-8 text-slate-100 shadow-[0_24px_90px_rgba(2,6,23,0.45)]">
          <p className="sign-in-eyebrow text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600">
            Security baseline
          </p>
          <div className="mt-6 grid gap-4">
            <div className="sign-in-security-card rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4">
              <p className="text-sm font-semibold text-white">Entrada autenticada antes da demonstracao</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                A demonstracao passa primeiro pela autenticacao e depois abre a Clara global do sistema.
              </p>
            </div>
            <div className="sign-in-security-card rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4">
              <p className="text-sm font-semibold text-white">Fluxo simples e contextual</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                O objetivo aqui nao e jogar voce em um menu tecnico. E abrir a Clara como porta inteligente do sistema, sem confundir isso com a Clara contextual do dossie.
              </p>
            </div>
            <div className="sign-in-security-card rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4">
              <p className="text-sm font-semibold text-white">Pensado para escritorio de direito bancario</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Clara, CRM, clientes, processos, agenda, diario oficial e financeiro operam conectados no mesmo sistema.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
