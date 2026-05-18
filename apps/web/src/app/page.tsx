import Link from "next/link";

const intakeSteps = [
  {
    title: "Etapa 1. Cadastro do cliente",
    detail:
      "O advogado cria o cliente com nome, CPF, telefone e nicho: revisional de veiculo, fraude bancaria PIX, fraude consignada ou busca e apreensao."
  },
  {
    title: "Etapa 2. Upload do contrato",
    detail:
      "PDF, fotos, prints, contrato, extrato e carne sobem para o caso e ja iniciam a inteligencia automatica."
  },
  {
    title: "Etapa 3. Dossie do caso",
    detail:
      "Cliente, banco, tipo de acao, risco, chance de exito e abusividade passam a ficar organizados em um unico lugar."
  },
  {
    title: "Etapa 4. Clara no fluxo",
    detail:
      "A Clara abre com o caso carregado, resume o que foi encontrado e orienta o proximo passo juridico."
  }
];

const automationSteps = [
  {
    title: "OCR",
    detail: "Le contrato, taxas, CET, parcelas, banco e juros automaticamente."
  },
  {
    title: "Calculos",
    detail:
      "Recalcula contrato, calcula juros reais, recalcula saldo, identifica abusividades e calcula repeticao de indebito."
  },
  {
    title: "BACEN",
    detail:
      "Consulta a media da modalidade na epoca, compara com a taxa do contrato e aponta abusividade relevante."
  },
  {
    title: "Estrategico",
    detail:
      "Analisa chance de exito, tipo de tese, risco e abusividade para criar o resumo estrategico do caso."
  },
  {
    title: "Pericial",
    detail:
      "Ao clicar em gerar laudo, o sistema usa OCR, BACEN, calculos e analises para montar tudo automaticamente."
  },
  {
    title: "Peticoes",
    detail:
      "Ao clicar em gerar peticao, o sistema monta fatos, fundamentos, pedidos, tutela e repeticao de indebito."
  },
  {
    title: "Clara IA",
    detail:
      "A Clara vive dentro do caso e conversa usando contrato, calculos, BACEN, parcelas e abusividades daquele cliente."
  }
];

const dossierHighlights = [
  "Visao geral com cliente, banco, tipo de acao, risco, chance de exito e abusividade.",
  "Documentos organizados no mesmo caso para leitura e decisao.",
  "Calculos automaticos e comparacao com a media BACEN da epoca.",
  "Resumo estrategico com tese sugerida, risco e alertas relevantes."
];

const modules = [
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
    detail: "Compromissos, tarefas e prazos como execucao diaria."
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
    <main className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xl font-bold text-blue-700">ADVX</p>
            <p className="text-sm text-slate-500">Sistema para escritorio de direito bancario</p>
          </div>
          <div className="flex gap-3">
            <Link
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              href="/sign-in"
            >
              Entrar
            </Link>
            <Link
              className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
              href="/sign-in"
            >
              Comecar gratis
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <p className="inline-flex rounded-full bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-700">
          Escritorio de direito bancario com fluxo simples e automacao real
        </p>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
          Voce cadastra o cliente e envia os documentos.
          <span className="text-blue-700"> O sistema devolve calculos, BACEN, estrategia, laudo, peticao e Clara.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          Esta plataforma foi desenhada para o fluxo real do direito bancario. O cliente entra, os documentos sobem,
          o caso se organiza e a Clara aparece dentro do sistema para resumir documentos, explicar riscos e orientar
          o proximo passo.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            className="rounded-lg bg-blue-700 px-8 py-3 text-lg font-semibold text-white transition hover:bg-blue-800"
            href="/sign-in"
          >
            Comecar gratis
          </Link>
          <DemoSignInButton
            className="rounded-lg border border-slate-300 px-8 py-3 text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
            label="Ver demonstracao"
          />
        </div>

        <p className="mt-4 text-sm text-slate-500">
          A demonstracao exige conta e abre a Clara na sessao lateral, nao no CRM e nao na aba do dossie.
        </p>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-slate-950">Como o sistema funciona</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {intakeSteps.map((item, index) => (
              <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-slate-950">
            O que acontece automaticamente depois do upload
          </h2>
          <p className="mt-3 text-center text-slate-600">
            O sistema nao so guarda arquivos. Ele interpreta, calcula, compara, estrutura e explica.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {automationSteps.map((item, index) => (
              <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-slate-950">O que aparece dentro do caso</h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                Clara na sessao lateral
              </p>
              <h3 className="mt-4 text-2xl font-bold text-slate-950">
                A Clara abre com o caso carregado e responde sobre aquele contexto.
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Ela entende contrato, calculos, BACEN, parcelas e abusividades do caso. Nao e um chat solto e nao
                joga o usuario em uma tela generica.
              </p>
              <div className="mt-6 rounded-xl bg-slate-950 p-5 text-left text-sm text-slate-100">
                <p>Clara, explique esse caso.</p>
                <p className="mt-4 text-slate-300">
                  O sistema identificou indicios relevantes no caso, consolidou os documentos, calculou o impacto
                  financeiro e sugeriu a melhor linha de atuacao para o escritorio.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-blue-700 p-8 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">
                Dossie do caso
              </p>
              <ul className="mt-6 space-y-4 text-sm leading-6">
                {dossierHighlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-slate-950">
            Tudo do escritorio em um sistema so
          </h2>
          <p className="mt-3 text-center text-slate-600">
            Clara no centro, com CRM, clientes, processos, agenda, diario oficial e financeiro conectados ao redor.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((item) => (
              <article key={item.title} className="rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-950">
            Menos trabalho manual. Mais clareza no caso. Mais velocidade para agir.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600">
            Crie sua conta, veja a Clara funcionando no fluxo real do direito bancario e continue com assinatura se
            fizer sentido para sua operacao.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              className="rounded-lg bg-blue-700 px-8 py-3 text-lg font-semibold text-white transition hover:bg-blue-800"
              href="/sign-in"
            >
              Criar conta gratis
            </Link>
            <DemoSignInButton
              className="rounded-lg border border-slate-300 px-8 py-3 text-lg font-semibold text-slate-700 transition hover:bg-white"
              label="Entrar na demonstracao"
            />
          </div>
        </div>
      </section>

      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500">
          <p>ADVX - Sistema moderno para escritorios de direito bancario</p>
          <p className="mt-1">Clara, CRM, clientes, processos, agenda, diario oficial e financeiro no mesmo fluxo.</p>
        </div>
      </footer>
    </main>
  );
}
