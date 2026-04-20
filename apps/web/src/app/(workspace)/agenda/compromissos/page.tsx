import { getClaraRecord, getClaraRecordDisplay } from "@/server/services/clara/clara-record-store";
import {
  getClaraAgendaArtifact,
  getClaraRevisionalAgendaArtifact
} from "@/server/services/clara/get-clara-artifacts";

const days = [
  "DOM. 05/04",
  "SEG. 06/04",
  "TER. 07/04",
  "QUA. 08/04",
  "QUI. 09/04",
  "SEX. 10/04",
  "SAB. 11/04"
];

export default async function AgendaCompromissosPage({
  searchParams
}: {
  searchParams?: {
    clara?: string;
    created?: string;
    record?: string;
    client?: string;
    case?: string;
    process?: string;
    document?: string;
    focus?: string;
    objetivo?: string;
  };
}) {
  const claraRecord = await getClaraRecord(searchParams?.record);
  const claraArtifact =
    claraRecord?.kind === "agenda"
      ? (claraRecord.payload as Awaited<ReturnType<typeof getClaraAgendaArtifact>>)
      : searchParams?.clara
        ? searchParams.focus === "revisional"
          ? await getClaraRevisionalAgendaArtifact({
              caseId: searchParams.case,
              clientId: searchParams.client,
              committed: searchParams.created === "1",
              documentId: searchParams.document,
              objective: searchParams.objetivo,
              processId: searchParams.process
            })
          : await getClaraAgendaArtifact(searchParams.client, searchParams.case, searchParams.created === "1")
        : null;
  const claraDisplay = claraArtifact
    ? getClaraRecordDisplay(claraRecord, "Compromisso preparado pela Clara", claraArtifact.message)
    : null;

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between gap-4">
        <p className="mj-model-title">Compromissos</p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button className="mj-model-button-gray" type="button">
            Integrar com o Google Agenda
          </button>
          <span className="rounded-[2px] bg-sky-500 px-2 py-1 text-[11px] font-semibold text-white">
            Novo!
          </span>
          <button className="mj-model-button-gray" type="button">
            Modo lista
          </button>
          <button className="mj-model-button-green" type="button">
            Adicionar
          </button>
        </div>
      </div>

      <section className="mj-model-panel px-4 py-4">
        <label className="mb-2 block text-[13px] font-semibold text-slate-300">Advogados</label>
        <select className="mj-model-input w-full px-3 outline-none">
          <option>Selecionar...</option>
        </select>
      </section>

      {claraArtifact ? (
        <section className="mj-model-panel px-4 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
            Compromisso preparado pela Clara
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-slate-300">
            <span className="rounded-[2px] border px-2 py-1 mj-model-gridline">{claraArtifact.statusLabel}</span>
            <span className="rounded-[2px] border px-2 py-1 mj-model-gridline">{claraArtifact.stageLabel}</span>
            <span className="rounded-[2px] border px-2 py-1 mj-model-gridline">{claraArtifact.recordId}</span>
          </div>
          <p className="mt-3 text-[15px] font-semibold text-white">{claraArtifact.clientLabel}</p>
          <p className="mt-2 text-[13px] leading-6 text-slate-300">{claraDisplay?.detail}</p>
          <p className="mt-3 text-[13px] text-slate-400">Caso: {claraArtifact.caseLabel}</p>
          <div className="mt-3 space-y-2">
            {claraArtifact.talkingPoints.map((item) => (
              <p key={item} className="text-[13px] leading-6 text-slate-300">
                • {item}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mj-model-panel px-4 py-4">
        <div className="mb-4 grid gap-3 xl:grid-cols-[8rem_1fr_12rem] xl:items-center">
          <div className="flex gap-2">
            <button className="mj-model-button-gray !min-h-0 !w-[2.4rem] !px-0" type="button">
              {"<"}
            </button>
            <button className="mj-model-button-gray !min-h-0 !w-[2.4rem] !px-0" type="button">
              {">"}
            </button>
            <button className="mj-model-button-gray !min-h-0" type="button">
              Hoje
            </button>
          </div>

          <div className="text-center text-[18px] font-medium text-slate-300">
            5 - 11 de abr. de 2026
          </div>

          <div className="flex justify-end gap-1">
            <button className="mj-model-button-gray !min-h-0 !px-3" type="button">
              Mes
            </button>
            <button className="mj-model-button-gray !min-h-0 !px-3" type="button">
              Semana
            </button>
            <button className="mj-model-button-gray !min-h-0 !px-3" type="button">
              Dia
            </button>
            <button className="mj-model-button-gray !min-h-0 !px-3" type="button">
              Lista
            </button>
          </div>
        </div>

        <div className="overflow-hidden border mj-model-gridline">
          <div className="grid grid-cols-7 border-b bg-black/10 text-[12px] font-semibold text-slate-300 mj-model-gridline">
            {days.map((day) => (
              <div key={day} className="border-l px-4 py-2 text-center first:border-l-0 mj-model-gridline">
                {day}
              </div>
            ))}
          </div>

          <div className="grid min-h-[30rem] grid-cols-7">
            {days.map((day) => (
              <div key={day} className="border-l first:border-l-0 mj-model-gridline" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
