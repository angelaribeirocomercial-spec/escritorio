import Link from "next/link";

const simpleFlow = [
  {
    step: "1. Cadastre o cliente",
    detail: "Nome, CPF, telefone e nicho do caso em poucos cliques."
  },
  {
    step: "2. Envie os documentos",
    detail: "Contrato, extrato, carne, fotos, PDFs e prints."
  },
  {
    step: "3. O sistema faz a parte pesada",
    detail: "OCR, calculos, BACEN, abusividades e dossie do caso organizados automaticamente."
  },
  {
    step: "4. Clara explica e orienta",
    detail: "A assistente resume o caso, aponta riscos, sugere tese e prepara o proximo passo."
  }
];

const dossierItems = [
  "Visao geral do cliente, banco, risco e chance de exito",
  "Documentos organizados no mesmo lugar",
  "Calculos automaticos do contrato",
  "Comparacao de taxa com o BACEN",
  "Resumo estrategico do caso",
  "Laudo pericial pronto para revisao",
  "Peticoes geradas com base no contexto",
  "Clara IA contextual dentro do caso"
];

const automationModules = [
  {
    title: "OCR",
    detail: "Le o contrato, taxas, CET, parcelas, banco e juros automaticamente."
  },
  {
    title: "Calculos",
    detail: "Recalcula contrato, saldo, juros reais e repeticao de indebito."
  },
  {
    title: "BACEN",
    detail: "Compara a taxa do contrato com a media da epoca e aponta abusividade."
  },
  {
    title: "Estrategico",
    detail: "Interpreta juridicamente os dados e sugere a melhor linha de acao."
  },
  {
    title: "Pericial",
    detail: "Monta o laudo com base nos documentos e nas analises."
  },
  {
    title: "Juridico",
    detail: "Gera peticoes com fatos, fundamentos, pedidos e tutela."
  },
  {
    title: "Clara IA",
    detail: "Conversa sobre o caso e explica tudo de forma simples."
  }
];

const structureCards = [
  {
    title: "Clara",
    detail: "Advogada digital e porta inteligente do fluxo do caso."
  },
  {
    title: "CRM",
    detail: "Entrada, relacionamento e passagem para cliente e caso."
  },
  {
    title: "Clientes",
    detail: "Base de clientes e ponto de partida para abertura de casos."
  },
  {
    title: "Processos",
    detail: "Carteira juridica e contexto processual do escritorio."
  },
  {
    title: "Agenda",
    detail: "Compromissos, tarefas e prazos na execucao diaria."
  },
  {
    title: "Diario oficial",
    detail: "Publicacoes, monitoramento e fila pratica de acompanhamento."
  },
  {
    title: "Financeiro",
    detail: "Receitas, despesas e leitura operacional do escritorio."
  }
];

const faqs = [
  {
    question: "Esse sistema substitui o advogado?",
    answer:
      "Nao. Ele automatiza leitura, organizacao, calculos e apoio estrategico. A decisao juridica continua com o advogado."
  },
  {
    question: "Serve para escritorio de direito bancario?",
    answer:
      "Sim. O foco e exatamente o fluxo bancario: revisional, fraudes e busca e apreensao."
  },
  {
    question: "A Clara entende o caso?",
    answer:
      "Sim. Ela responde com base no contexto daquele caso, e nao como um chat generico."
  }
];

function DemoSignInButton({
  className,
  label
}: {
  className: string;
  label: string;
}) {
  return (
    <form action="/api/auth/demo-sign-in" method="post">
      <button className={className} type="submit">
        {label}
      </button>
    </form>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-white/5 bg-[linear-gradient(180deg,#06101a,#081827_42%,#0a1220)]">
        <div className="absolute inset-0 bg-lexia-glow opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(34,211,238,0.18),transparent_24%),radial-gradient(circle_at_78%_16%,rgba(245,185,66,0.16),transparent_22%),radial-gradient(circle_at_68%_76%,rgba(12,74,110,0.28),transparent_28%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                ADVX
              </p>
              <p className="mt-2 text-sm font-medium text-slate-300">
                Plataforma para escritorios de direito bancario
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 shadow-soft"
                href="/sign-in"
              >
                Comecar gratis
              </Link>
              <DemoSignInButton
                className="rounded-2xl bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-soft"
                label="Ver demonstracao"
              />
            </div>
          </div>

          <section className="mt-14 grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Fluxo simples. Automacao real. Clara dentro do caso.
              </div>
              <h1 className="mt-6 max-w-5xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.05em] text-white sm:text-6xl">
                Seu escritorio entra com documentos.
                <span className="block text-slate-300">
                  O sistema devolve estrategia, calculos e orientacao da Clara.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Cadastre o cliente, envie contrato, extrato, fotos e prints. A plataforma organiza o caso, identifica abusividades, compara com o BACEN e coloca a Clara para explicar o proximo passo com rapidez e clareza.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="rounded-2xl bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-6 py-4 text-sm font-semibold text-slate-950 shadow-soft"
                  href="/sign-in"
                >
                  Comecar gratis
                </Link>
                <DemoSignInButton
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-slate-100 shadow-soft"
                  label="Ver demonstracao"
                />
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Direito bancario",
                    value: "1 fluxo",
                    detail: "Cliente, contrato, calculos, BACEN e Clara no mesmo caso."
                  },
                  {
                    label: "Automacao",
                    value: "7 modulos",
                    detail: "OCR, calculos, BACEN, estrategico, pericial, juridico e Clara."
                  },
                  {
                    label: "Entrada",
                    value: "1 conta",
                    detail: "Comece gratis e entre direto na demonstracao contextualizada."
                  }
                ].map((signal) => (
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
              <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(9,18,34,0.96),rgba(12,25,44,0.92)_58%,rgba(8,65,86,0.42))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_88%_18%,rgba(244,63,94,0.12),transparent_24%)]" />
                <div className="relative">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                        Clara dentro do caso
                      </p>
                      <p className="mt-2 font-display text-2xl font-semibold text-white">
                        Dossie, calculos e orientacao no mesmo fluxo
                      </p>
                    </div>
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                      Clara-first
                    </span>
                  </div>

                  <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm text-slate-100">
                    Clara, explique esse caso.
                  </div>

                  <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Resposta contextual
                    </p>
                    <p className="mt-3 text-sm font-semibold text-white">
                      A taxa do contrato esta 88% acima da media BACEN. Ha indicios de venda casada de seguro. O saldo revisado reduz em R$ 14.000.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Tese sugerida
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          Acao revisional com pedido liminar
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Proximo passo
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          Abrir laudo e revisar peticao
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Feito para o fluxo real
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
              Direito bancario com entrada simples e operacao organizada.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              Nao e um software juridico generico. E um sistema moderno para escritorios que atuam com revisional de veiculo, fraude bancaria PIX, fraude consignada e busca e apreensao.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {simpleFlow.map((item) => (
              <article
                key={item.step}
                className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-soft"
              >
                <p className="text-lg font-semibold text-white">{item.step}</p>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-300">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-[linear-gradient(180deg,#090d14,#0d121b)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
              Tudo fica dentro do caso
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
              O sistema concentra leitura, decisao e execucao no mesmo dossie.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              Em vez de espalhar informacao em planilhas, pastas e conversas soltas, o sistema concentra tudo em um dossie unico, organizado para leitura, decisao e execucao.
            </p>
          </div>

          <div className="grid gap-3">
            {dossierItems.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-medium text-slate-200 shadow-soft"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Automacao real
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
              Menos trabalho manual. Mais clareza no caso.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              O visitante precisa entender rapido que o sistema faz a parte pesada e entrega base juridica utilizavel para o escritorio agir.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {automationModules.map((module) => (
              <article
                key={module.title}
                className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-soft"
              >
                <p className="text-lg font-semibold text-white">{module.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{module.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-[linear-gradient(180deg,#070b11,#0a0f17)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
              Clara dentro do caso
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
              A Clara nao e um chat solto.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              Ela entende o cliente, o contrato, os calculos, o BACEN, as parcelas e as abusividades daquele caso para responder com contexto e orientar o advogado.
            </p>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(9,18,34,0.96),rgba(12,25,44,0.88)_58%,rgba(38,80,120,0.28))] p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Exemplo de conversa
            </p>
            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-medium text-slate-100">
              Clara, explique esse caso.
            </div>
            <div className="mt-4 rounded-[24px] border border-white/10 bg-white p-5 text-sm leading-7 text-slate-700">
              <p>
                A taxa do contrato esta 88% acima da media BACEN. Ha indicios de venda casada de seguro. O saldo revisado reduz em R$ 14.000. Existe boa probabilidade de revisao judicial.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Estrutura consolidada
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
              Tudo do escritorio em um sistema so.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              A Clara fica no centro do caso, enquanto o restante da operacao segue conectado no mesmo fluxo.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {structureCards.map((item) => (
              <article
                key={item.title}
                className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-soft"
              >
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Simples de usar
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
              Parece sofisticado. Na pratica, e simples de usar.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              O fluxo foi pensado para ser direto: cadastrar, enviar, analisar e agir. O sistema faz a parte pesada para o escritorio ganhar velocidade, clareza e organizacao.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Menos trabalho manual",
              "Mais clareza no caso",
              "Mais velocidade para decidir",
              "Mais organizacao para o escritorio"
            ].map((item) => (
              <div
                key={item}
                className="rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-5 text-sm font-semibold text-slate-100 shadow-soft"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-[linear-gradient(180deg,#070b11,#0a0f17)]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(9,18,34,0.98),rgba(13,23,41,0.9)_58%,rgba(8,65,86,0.35))] px-8 py-10 text-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.4)] sm:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Comece gratis
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-[-0.04em] text-white">
              Comece gratis e veja a Clara funcionando no seu fluxo.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
              Crie sua conta para conhecer um sistema moderno, simples de usar e feito para escritorios de direito bancario. Em poucos passos, voce entende como o cliente entra, como os documentos sao analisados e como a Clara ajuda a orientar o caso.
            </p>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-300">
              Sem complicacao. Sem curva longa. Com demonstracao guiada dentro do fluxo real.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-2xl bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-6 py-4 text-sm font-semibold text-slate-950 shadow-soft"
                href="/sign-in"
              >
                Criar conta gratis
              </Link>
              <DemoSignInButton
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-100"
                label="Ver demonstracao"
              />
            </div>
            <p className="mt-4 text-sm text-slate-300">
              Entre gratis, conheca a experiencia e continue com assinatura se fizer sentido para sua operacao.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              FAQ
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
              Perguntas frequentes.
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
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(9,18,34,0.98),rgba(13,23,41,0.9)_58%,rgba(96,37,112,0.32))] px-8 py-10 text-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.4)] sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Pronto para ver funcionando
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-[-0.04em] text-white">
            Menos trabalho manual. Mais clareza no caso. Mais velocidade para agir.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
            Centralize a operacao do escritorio e deixe a Clara ajudar a explicar, organizar e acelerar o proximo passo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-2xl bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-6 py-4 text-sm font-semibold text-slate-950 shadow-soft"
              href="/sign-in"
            >
              Comecar gratis
            </Link>
            <DemoSignInButton
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-100"
              label="Entrar na demonstracao"
            />
          </div>
          <p className="mt-4 text-sm text-slate-300">Feito para escritorio de direito bancario.</p>
        </div>
      </section>
    </main>
  );
}
