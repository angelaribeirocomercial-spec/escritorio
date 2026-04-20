import { getClaraDeadlineArtifact } from "@/server/services/clara/get-clara-artifacts";
import { getClaraRecord, getClaraRecordDisplay } from "@/server/services/clara/clara-record-store";

export default async function AgendaPrazosPage({
  searchParams
}: {
  searchParams?: { clara?: string; created?: string; record?: string; action?: string };
}) {
  const claraRecord = await getClaraRecord(searchParams?.record);
  const claraArtifact =
    claraRecord?.kind === "deadline"
      ? (claraRecord.payload as Awaited<ReturnType<typeof getClaraDeadlineArtifact>>)
      : searchParams?.clara
        ? await getClaraDeadlineArtifact(searchParams.action, searchParams.created === "1")
        : null;
  const claraDisplay = claraArtifact
    ? getClaraRecordDisplay(claraRecord, "Prazo preparado pela Clara", claraArtifact.summary)
    : null;

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="mj-model-title">Prazos</p>
          <p className="mj-model-subtitle">Exibindo 0 resultado(s)</p>
        </div>
        <div className="flex gap-2">
          <button className="mj-model-button-gray" type="button">
            Importar lote
          </button>
          <button className="mj-model-button-green" type="button">
            Adicionar
          </button>
        </div>
      </div>

      <p className="text-[13px] text-slate-400">
        prazo em dia prazo expirando prazo expirado prazo baixado
      </p>

      <section className="mj-model-toolbar px-4 py-4">
        <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto]">
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Prazo atendido (baixado)</label>
            <select className="mj-model-input w-full px-3 outline-none">
              <option>Nao</option>
              <option>Todos</option>
              <option>Sim</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Inicio</label>
            <input className="mj-model-input w-full px-3 outline-none" placeholder="__/__/____" type="text" />
          </div>
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Fim</label>
            <input className="mj-model-input w-full px-3 outline-none" placeholder="__/__/____" type="text" />
          </div>
          <div>
            <label className="mb-2 block text-[13px] text-slate-400">Filtrar pela data do prazo / Filtrar pela data interna</label>
            <div className="px-1 py-3 text-[13px] text-slate-400">Advogados</div>
          </div>
          <div>
            <label className="mb-2 block text-[13px]" style={{ color: "transparent" }}>Advogados</label>
            <select className="mj-model-input w-full px-3 outline-none">
              <option>Selecionar...</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="mj-model-button-gray" type="button">
              Buscar
            </button>
          </div>
        </div>
      </section>

      <div className="mj-model-panel px-4 py-4">
        <p className="mj-model-empty">Voce ainda nao cadastrou nenhum prazo.</p>
      </div>

      {claraArtifact ? (
        <section className="mj-model-panel px-4 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {claraDisplay?.title}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
            <span className="rounded-full border px-2 py-1 mj-model-gridline">{claraArtifact.statusLabel}</span>
            <span className="rounded-full border px-2 py-1 mj-model-gridline">{claraArtifact.stageLabel}</span>
            <span className="rounded-full border px-2 py-1 mj-model-gridline">{claraArtifact.recordId}</span>
          </div>
          <p className="mt-3 text-[15px] text-slate-200">{claraDisplay?.detail}</p>
          <p className="mt-2 text-[13px] text-slate-400">
            Acao de origem: {claraArtifact.actionLabel}
          </p>
          <ul className="mt-3 space-y-1 text-[13px] text-slate-400">
            {claraArtifact.steps.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
          {claraDisplay?.reviewNote ? (
            <p className="mt-3 text-[13px] text-slate-400">Revisao humana: {claraDisplay.reviewNote}</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
