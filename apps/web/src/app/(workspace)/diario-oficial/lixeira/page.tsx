import Link from "next/link";
import { WorkspaceStatePanel } from "@lexia/ui";

import { getArchivedOfficialDiaryPublications } from "@/server/services/official-diary/get-official-diary";

export default async function DiarioOficialLixeiraPage() {
  let publications: Awaited<ReturnType<typeof getArchivedOfficialDiaryPublications>> = [];
  let state: { title: string; description: string; tone?: "neutral" | "warning" | "danger" } | null = null;

  try {
    publications = await getArchivedOfficialDiaryPublications();
  } catch {
    state = {
      title: "Publicacoes excluidas indisponiveis",
      description: "Nao foi possivel carregar a lixeira real de publicacoes do Diario Oficial.",
      tone: "danger"
    };
  }

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="mj-model-title">Publicacoes excluidas</p>
          <p className="mj-model-subtitle">Exibindo {publications.length} resultado(s)</p>
        </div>
        <Link className="mj-model-button-gray inline-flex items-center justify-center" href="/diario-oficial/publicacoes">
          Voltar
        </Link>
      </div>

      <div className="rounded-[4px] border border-slate-200 bg-slate-50 px-4 py-4 text-[13px] leading-6 text-slate-600">
        Publicacoes arquivadas sao consultadas em `official_diary_publications.archived_at`.
      </div>

      {state ? (
        <WorkspaceStatePanel description={state.description} title={state.title} tone={state.tone ?? "neutral"} />
      ) : publications.length ? (
        <div className="mj-model-panel overflow-hidden">
          {publications.map((publication, index) => (
            <div key={publication.id} className="px-4 py-3 text-[13px]" style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}>
              <p className="font-semibold text-slate-100">{publication.title}</p>
              <p className="mt-1 text-slate-400">{publication.sourceLabel} | {publication.archivedAt}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mj-model-panel px-4 py-4 text-[13px] text-slate-300">
          Nao existem publicacoes arquivadas na base real.
        </div>
      )}
    </div>
  );
}
