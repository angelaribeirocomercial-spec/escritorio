import Link from "next/link";

const commandSignals = [
  {
    label: "Pipeline juridico",
    value: "142 casos",
    detail: "Carteira viva com triagem, contratos e tarefas conectadas."
  },
  {
    label: "Clara ativa",
    value: "247 respostas",
    detail: "Assistente contextual operando dentro do fluxo do escritorio."
  },
  {
    label: "Tempo recuperado",
    value: "31h/semana",
    detail: "Menos dispersao operacional e mais decisao juridica de valor."
  }
];

const operatingLayers = [
  {
    title: "Relacionamento e intake",
    detail:
      "Clientes, origem, score juridico, contrato e pendencias no mesmo trilho operacional."
  },
  {
    title: "Carteira e contencioso",
    detail:
      "Casos, banco, tese, risco, ownership e potencial financeiro organizados para decidir rapido."
  },
  {
    title: "Documentos e contratos",
    detail:
      "GED inteligente com leitura premium de contrato bancario, sinais de abusividade e contexto processual."
  },
  {
    title: "Execucao e producao",
    detail:
      "Tarefas, urgencias, checklist, agenda interna e proximas acoes numa unica mesa operacional."
  }
];

const claraCapabilities = [
  "Resumir documentos e contratos com contexto do caso",
  "Apontar pendencias e proximo melhor passo do escritorio",
  "Organizar resposta juridica por cliente, tarefa e caso ativo",
  "Ajudar a transformar backlog disperso em operacao priorizada"
];

const workflowSteps = [
  {
    step: "01",
    title: "Entrou cliente, ADVX organiza",
    detail:
      "Triagem, score, banco, origem, contrato e documentos deixam de viver em silos."
  },
  {
    step: "02",
    title: "Clara le o contexto inteiro",
    detail:
      "A assistente responde com base no objeto certo, e nao como um chat solto."
  },
  {
    step: "03",
    title: "Operacao anda com menos atrito",
    detail:
      "Dashboard, tarefas, GED e casos passam a funcionar como um sistema unico."
  }
];

const testimonials = [
  {
    name: "Helena Siqueira",
    role: "Socia · contencioso bancario",
    quote:
      "A ADVX parece produto pronto para vender porque a Clara nao fica solta. Ela responde dentro da operacao real."
  },
  {
    name: "Caio Nascimento",
    role: "Coordenacao juridica",
    quote:
      "O ganho nao foi so visual. A leitura da carteira e das prioridades ficou muito mais imediata."
  },
  {
    name: "Julia Ramalho",
    role: "Head de litigio",
    quote:
      "Dashboard, tarefas e analise contratual finalmente parecem partes do mesmo software."
  }
];

const faqs = [
  {
    question: "A ADVX e um software juridico generico?",
    answer:
      "Nao. O posicionamento atual e de plataforma juridica voltada ao fluxo bancario, com Clara como camada contextual de operacao."
  },
  {
    question: "A Clara substitui o trabalho juridico?",
    answer:
      "Nao. A Clara organiza contexto, sugere caminhos e acelera leitura e execucao. A decisao continua com o escritorio."
  },
  {
    question: "Ja existe demonstracao funcional?",
    answer:
      "Sim. O produto ja demonstra dashboard, clientes, casos, documentos, tarefas, analise contratual e workspace dedicado da Clara."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-white/5 bg-[linear-gradient(180deg,#04060b,#08101a_48%,#0a1320)]">
        <div className="absolute inset-0 bg-lexia-glow opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(244,63,94,0.12),transparent_24%),radial-gradient(circle_at_78%_12%,rgba(34,211,238,0.14),transparent_26%),radial-gradient(circle_at_70%_76%,rgba(96,37,112,0.18),transparent_28%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                ADVX
              </p>
              <p className="mt-2 text-sm font-medium text-slate-300">
                Plataforma juridica com Clara, assistente digital contextual
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 shadow-soft"
                href="/clara"
              >
                Ver Clara
              </Link>
              <Link
                className="rounded-2xl bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-soft"
                href="/dashboard"
              >
                Entrar na demonstracao
              </Link>
            </div>
          </div>

          <section className="mt-14 grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Clara no centro da operacao
              </div>
              <h1 className="mt-6 max-w-5xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.05em] text-white sm:text-6xl">
                ADVX organiza o escritorio.
                <span className="block text-slate-300">
                  Clara transforma contexto em acao.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Um produto para operar clientes, casos, contratos, tarefas e decisao juridica com coerencia de software premium, nao com cara de painel administrativo comum.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="rounded-2xl bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-6 py-4 text-sm font-semibold text-slate-950 shadow-soft"
                  href="/dashboard"
                >
                  Explorar produto
                </Link>
                <Link
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-slate-100 shadow-soft"
                  href="/analise-contrato"
                >
                  Ver analise contratual
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {commandSignals.map((signal) => (
                  <article
                    key={signal.label}
                    className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-soft"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {signal.label}
                    </p>
                    <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
                      {signal.value}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{signal.detail}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(9,18,34,0.96),rgba(12,25,44,0.9)_58%,rgba(96,37,112,0.36))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_88%_18%,rgba(244,63,94,0.14),transparent_24%)]" />
                <div className="relative">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                        Clara
                      </p>
                      <p className="mt-2 font-display text-2xl font-semibold text-white">
                        Console juridico contextual
                      </p>
                    </div>
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                      Em operacao
                    </span>
                  </div>

                  <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm text-slate-100">
                    Clara, priorize os gargalos da carteira e me diga o que destrava mais valor juridico hoje.
                  </div>

                  <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Resposta contextual
                    </p>
                    <p className="mt-3 text-sm font-semibold text-white">
                      A carteira pede foco em pendencias documentais, tutela urgente e consolidacao de tese revisional.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Cliente travado
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          Patricia Gomes Araujo
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Proximo passo
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          Fechar pedido de tutela
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                    Dashboard executivo
                  </p>
                  <p className="mt-3 font-display text-3xl font-semibold text-white">R$ 215 mil</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Potencial da carteira com urgencias, gargalos e leitura operacional real.
                  </p>
                </article>

                <article className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                    Contrato bancario
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    CET, abusividade e risco em uma tela premium
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Clara ajuda a ler o contrato dentro do contexto do caso e da estrategia.
                  </p>
                </article>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Camadas de operacao
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
              ADVX nao e so bonito.
              <span className="block text-slate-300">
                Ele organiza o escritorio em blocos que realmente se conversam.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              O ganho do produto aparece quando intake, carteira, documentos, contratos e execucao saem do caos operacional e passam a operar no mesmo sistema.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {operatingLayers.map((layer) => (
              <article
                key={layer.title}
                className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-soft"
              >
                <p className="text-lg font-semibold text-white">{layer.title}</p>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-300">
                  {layer.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-[linear-gradient(180deg,#090d14,#0d121b)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
              Clara
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
              A assistente digital precisa atuar dentro do trabalho.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              Clara nao entra como vitrine. Ela entra para ler contexto real, organizar proximo passo, resumir documento e acelerar resposta juridica com base no objeto certo.
            </p>

            <div className="mt-8 grid gap-3">
              {claraCapabilities.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-medium text-slate-200 shadow-soft"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(9,18,34,0.96),rgba(12,25,44,0.88)_58%,rgba(38,80,120,0.28))] p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Exemplo de conversa
            </p>
            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-medium text-slate-100">
              Clara, analise este contrato bancario e me diga se ha sinais consistentes de revisional.
            </div>
            <div className="mt-4 rounded-[24px] border border-white/10 bg-white p-5 text-sm leading-7 text-slate-700">
              <p className="font-semibold text-slate-950">Leitura inicial</p>
              <p className="mt-2">
                Ha indicios relevantes de custo efetivo elevado, capitalizacao mensal e espaco para tese revisional bem sustentada.
              </p>
              <p className="mt-4 font-semibold text-slate-950">Acao sugerida</p>
              <p className="mt-2">1. Revisar memoria de calculo</p>
              <p>2. Confirmar pedido de tutela</p>
              <p>3. Estruturar narrativa inicial do caso</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Como opera
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
              Tres movimentos para sair de software bonito e virar sistema util.
            </h2>
          </div>

          <div className="grid gap-4">
            {workflowSteps.map((item) => (
              <article
                key={item.step}
                className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-soft"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                    Etapa {item.step}
                  </div>
                  <div className="max-w-2xl">
                    <p className="text-xl font-semibold text-white">{item.title}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{item.detail}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-soft"
            >
              <p className="text-sm leading-7 text-slate-200">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-5 text-base font-semibold text-white">{item.name}</p>
              <p className="mt-1 text-sm font-semibold text-cyan-200">{item.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-white/5 bg-[linear-gradient(180deg,#070b11,#0a0f17)]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                FAQ
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
                Perguntas frequentes sobre a ADVX.
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-soft"
                >
                  <p className="text-lg font-semibold text-white">{faq.question}</p>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-300">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(9,18,34,0.98),rgba(13,23,41,0.9)_58%,rgba(96,37,112,0.32))] px-8 py-10 text-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.4)] sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            CTA final
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-[-0.04em] text-white">
            ADVX para estruturar a operacao.
            <span className="block text-slate-300">Clara para acelerar a decisao.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
            O produto foi redesenhado para parecer uma plataforma juridica de alto valor comercial e operar como uma base real de demonstracao e evolucao.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-2xl bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-6 py-4 text-sm font-semibold text-slate-950 shadow-soft"
              href="/dashboard"
            >
              Entrar na demonstracao
            </Link>
            <Link
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-100"
              href="/clara"
            >
              Abrir workspace da Clara
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
