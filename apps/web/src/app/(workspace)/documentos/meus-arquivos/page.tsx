import { getClaraComparisonArtifact } from "@/server/services/clara/get-clara-artifacts";
import { getClaraRecord, getClaraRecordDisplay } from "@/server/services/clara/clara-record-store";

function ToolButton({
  label,
  active = false
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={
        active
          ? "mj-model-button-green !min-h-0 !w-[2.5rem] !px-0 !py-1"
          : "mj-model-button-gray !min-h-0 !w-[2.5rem] !px-0 !py-1"
      }
      type="button"
    >
      {label}
    </button>
  );
}

export default async function MeusArquivosPage({
  searchParams
}: {
  searchParams?: { clara?: string; created?: string; record?: string; document?: string; document2?: string };
}) {
  const claraRecord = await getClaraRecord(searchParams?.record);
  const claraArtifact =
    claraRecord?.kind === "comparison"
      ? (claraRecord.payload as Awaited<ReturnType<typeof getClaraComparisonArtifact>>)
      : searchParams?.clara
        ? await getClaraComparisonArtifact(searchParams.document, searchParams.document2, searchParams.created === "1")
        : null;
  const claraDisplay = claraArtifact
    ? getClaraRecordDisplay(claraRecord, "Comparacao preparada pela Clara", claraArtifact.summary)
    : null;

  return (
    <div className="mj-model-page space-y-4">
      <p className="mj-model-title">Meus arquivos</p>

      <section className="mj-model-panel overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3 mj-model-gridline">
          <div className="flex items-center gap-1.5">
            <ToolButton label="<" />
            <ToolButton label="..." />
            <ToolButton label="||" />
            <ToolButton active label="o" />
            <ToolButton label="+" />
            <ToolButton label="x" />
            <ToolButton label="i" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[13px] text-slate-400">Utilizado: 0.0%</span>
            <input className="mj-model-input w-[12rem] px-3 outline-none" placeholder="Buscar arquivos..." type="text" />
            <ToolButton label="?" />
            <ToolButton label="#" />
            <ToolButton label="=" />
          </div>
        </div>

        <div className="grid min-h-[34rem] grid-cols-[13rem_1fr]">
          <aside className="border-r bg-black/10 mj-model-gridline">
            <div className="border-b px-3 py-3 text-[13px] font-semibold mj-model-gridline">v INICIO</div>
            <div className="px-3 py-3 text-[13px] text-slate-400">Inicio</div>
          </aside>

          <section className="relative px-4 py-4">
            <p className="absolute left-8 top-7 text-[13px] text-slate-400">Esta pasta esta vazia.</p>
          </section>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3 text-[13px] text-slate-400 mj-model-gridline">
          <span>Inicio</span>
          <span>0 itens</span>
        </div>
      </section>

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
            Documento 1: {claraArtifact.firstLabel} · Documento 2: {claraArtifact.secondLabel}
          </p>
          <ul className="mt-3 space-y-1 text-[13px] text-slate-400">
            {claraArtifact.findings.map((item) => (
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
