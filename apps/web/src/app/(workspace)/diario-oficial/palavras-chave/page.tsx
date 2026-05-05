import Link from "next/link";
import { WorkspaceStatePanel } from "@lexia/ui";

import { getAdversaries } from "@/server/services/adversaries/get-adversaries";
import { getOfficialDiaryPublications } from "@/server/services/official-diary/get-official-diary";

const diaryWarnings = [
  "As palavras abaixo sao derivadas de adversos e publicacoes reais do tenant.",
  "A configuracao oficial de captura depende da integracao do Diario Oficial."
];

export default async function DiarioOficialPalavrasPage() {
  let keywords: string[] = [];
  let state: { title: string; description: string; tone?: "neutral" | "warning" | "danger" } | null = null;

  try {
    const [adversaries, publications] = await Promise.all([
      getAdversaries(),
      getOfficialDiaryPublications()
    ]);
    keywords = [
      ...new Set(
        [
          ...adversaries.flatMap((adversary) => [adversary.name, adversary.bankName]),
          ...publications.flatMap((publication) => [
            publication.client.fullName,
            publication.bankingCase.bankName,
            publication.judicialProcess.processNumber
          ])
        ]
          .filter(Boolean)
          .sort()
      )
    ];
  } catch {
    state = {
      title: "Palavras-chave indisponiveis no momento",
      description: "Nao foi possivel derivar palavras-chave a partir da base real do tenant ativo.",
      tone: "danger"
    };
  }

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="mj-model-title">Palavras-chave para recebimento de publicacoes</p>
          <p className="mj-model-subtitle">Exibindo {keywords.length} resultado(s)</p>
        </div>
        <Link
          className="mj-model-button-green inline-flex items-center justify-center"
          href="/configuracoes/integracoes"
          title="Abrir a configuracao das integracoes oficiais."
        >
          Configurar OAB
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[22rem_1fr]">
        <div className="mj-model-panel overflow-hidden">
          <div className="mj-model-gridline grid grid-cols-[1fr_3rem] border-b px-3 py-2 text-[13px] font-semibold text-slate-400">
            <span>Quantidade de monitoramentos derivados</span>
            <span>{keywords.length}</span>
          </div>
          <div className="grid grid-cols-[1fr_3rem] px-3 py-2 text-[13px] text-slate-300">
            <span>Status</span>
            <span>real</span>
          </div>
        </div>

        <div className="rounded-[4px] border border-slate-200 bg-slate-50 px-4 py-4 text-[13px] leading-6 text-slate-600">
          {diaryWarnings.map((warning) => (
            <p key={warning} className="mb-2 break-words last:mb-0">
              {warning}
            </p>
          ))}
        </div>
      </div>

      {state ? (
        <WorkspaceStatePanel description={state.description} title={state.title} tone={state.tone ?? "neutral"} />
      ) : keywords.length ? (
        <div className="mj-model-panel overflow-hidden">
          {keywords.map((keyword, index) => (
            <div key={keyword} className="px-4 py-3 text-[13px] text-slate-300" style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}>
              {keyword}
            </div>
          ))}
        </div>
      ) : (
        <div className="mj-model-panel px-4 py-4 text-[13px] text-slate-300">
          Nenhuma palavra-chave foi derivada da base real.
        </div>
      )}
    </div>
  );
}
