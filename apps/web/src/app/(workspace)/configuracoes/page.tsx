import { WorkspacePage } from "@/components/layout/workspace-page";

const metrics = [
  { label: "Tenant", value: "ADVX Demo" },
  { label: "Plano", value: "Pro" },
  { label: "Branding", value: "Navy + Amber" },
  { label: "Modo Escuro", value: "Preparado" }
];

export default function ConfiguracoesPage() {
  return (
    <WorkspacePage
      description="Area de governanca do tenant para branding, preferencias, politicas e controle de operacao da Clara."
      eyebrow="Configuracoes"
      metrics={metrics}
      title="Governanca, identidade e preferencias do tenant"
    >
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,34,0.96),rgba(13,25,48,0.88)_58%,rgba(96,37,112,0.24))] p-6 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-200/90">
            Governanca do produto
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Configuracao precisa parecer camada empresarial, nao formulario cru.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Branding, tenant, plano, preferencias e politicas futuras devem viver em uma area que comunica controle, maturidade e ownership do ambiente.
          </p>
        </article>

        <article className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,20,35,0.94),rgba(14,24,42,0.84))] p-6 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Blocos previstos
          </p>
          <div className="mt-5 grid gap-3">
            {[
              "Branding do escritorio e identidade do tenant",
              "Preferencias de uso, IA e modos operacionais",
              "Politicas de acesso, papeis e configuracao da base"
            ].map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-6 text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </WorkspacePage>
  );
}
