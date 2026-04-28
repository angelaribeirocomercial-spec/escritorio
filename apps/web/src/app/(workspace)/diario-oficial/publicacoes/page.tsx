import Link from "next/link";
import { WorkspaceStatePanel } from "@lexia/ui";

import { getOfficialDiaryPublications } from "@/server/services/official-diary/get-official-diary";

function urgencyLabel(urgency: string) {
  switch (urgency) {
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    default:
      return "Baixa";
  }
}

export default async function DiarioOficialPublicacoesPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
  };
}) {
  let publications: Awaited<ReturnType<typeof getOfficialDiaryPublications>> = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    publications = await getOfficialDiaryPublications();
  } catch {
    state = {
      title: "Publicacoes indisponiveis no momento",
      description:
        "Nao foi possivel carregar a base real do Diario Oficial. Valide a configuracao do Supabase, a migration da vertical e o seed do tenant ativo.",
      tone: "danger"
    };
  }

  const query = searchParams?.q?.toLowerCase().trim() ?? "";
  const filteredPublications = publications.filter((publication) => {
    if (!query) return true;

    return [
      publication.title,
      publication.client.fullName,
      publication.bankingCase.title,
      publication.judicialProcess.processNumber,
      publication.sourceLabel,
      publication.requiredAction
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mj-model-title">Publicacoes</p>
          <p className="mj-model-subtitle">Exibindo {filteredPublications.length} resultado(s)</p>
        </div>
        <Link className="mj-model-button-gray inline-flex items-center justify-center" href="/diario-oficial">
          Voltar
        </Link>
      </div>

      <div className="mj-model-soft-panel px-4 py-4 text-[13px] leading-6 text-slate-400">
        <p>As publicacoes abaixo sao a base real persistida do tenant ativo.</p>
        <p>A conferencia humana continua obrigatoria antes de qualquer resposta formal.</p>
      </div>

      <section className="mj-model-toolbar px-4 py-4">
        <form className="grid gap-3 xl:grid-cols-[1fr_auto]" method="get">
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Busca</label>
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.q ?? ""}
              name="q"
              placeholder="Cliente, processo, fonte ou acao exigida"
              type="search"
            />
          </div>
          <div className="flex items-end">
            <button className="mj-model-button-gray" type="submit">
              Buscar
            </button>
          </div>
        </form>
      </section>

      {state ? (
        <WorkspaceStatePanel
          description={state.description}
          title={state.title}
          tone={state.tone ?? "neutral"}
        />
      ) : filteredPublications.length ? (
        <section className="mj-model-panel overflow-hidden">
          <div className="grid grid-cols-[8rem_1.2fr_1fr_8rem_7rem] border-b bg-black/10 px-3 py-3 text-[13px] font-semibold text-slate-300 mj-model-gridline">
            <span>Data</span>
            <span>Publicacao</span>
            <span>Cliente / Processo</span>
            <span>Urgencia</span>
            <span className="text-right">Abrir</span>
          </div>

          {filteredPublications.map((publication, index) => (
            <div
              key={publication.id}
              className="grid grid-cols-[8rem_1.2fr_1fr_8rem_7rem] items-center px-3 py-3 text-[13px]"
              style={{ borderTop: index === 0 ? "none" : "1px solid var(--surface-border)" }}
            >
              <span className="text-slate-300">
                {new Date(publication.publishedAt).toLocaleDateString("pt-BR")}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-200">{publication.title}</p>
                <p className="mt-1 truncate text-[12px] text-slate-400">
                  {publication.sourceLabel} | {publication.requiredAction}
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-slate-200">{publication.client.fullName}</p>
                <p className="mt-1 truncate text-[12px] text-slate-400">
                  {publication.judicialProcess.processNumber}
                </p>
              </div>
              <span className="text-slate-300">{urgencyLabel(publication.urgency)}</span>
              <div className="text-right">
                <Link
                  className="text-slate-300 transition hover:text-white"
                  href={`/diario-oficial/${publication.id}`}
                >
                  abrir
                </Link>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="mj-model-panel px-4 py-4">
          <p className="mj-model-empty">Nenhuma publicacao encontrada para o filtro atual.</p>
        </div>
      )}
    </div>
  );
}
