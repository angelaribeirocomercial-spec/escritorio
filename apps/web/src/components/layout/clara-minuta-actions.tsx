"use client";

import Link from "next/link";

type ClaraMinutaActionsProps = {
  recordId: string;
  showDistributionAction?: boolean;
};

export function ClaraMinutaActions({
  recordId,
  showDistributionAction = true
}: ClaraMinutaActionsProps) {
  const exportBaseHref = `/api/clara/minutas/${recordId}/exportacao`;
  const handoffHref = `/editor-de-texto/distribuicao?record=${encodeURIComponent(recordId)}&handoff=1`;

  return (
    <div className="mt-4 space-y-3 rounded-[4px] border bg-black/10 px-4 py-4 mj-model-gridline">
      <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        Exportacao e proximo passo
      </p>
      <p className="text-[13px] leading-6 text-slate-300">
        A revisao final, a exportacao em PDF e a impressao saem deste bloco. O handoff de distribuicao so aparece
        para peticoes aptas a protocolo.
      </p>
      <div className={`grid gap-3 ${showDistributionAction ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        {showDistributionAction ? (
          <Link className="mj-model-button-green inline-flex items-center justify-center" href={handoffHref}>
            Pronto para distribuir
          </Link>
        ) : null}
        <a
          className="mj-model-button-gray inline-flex items-center justify-center"
          href={`${exportBaseHref}?format=txt`}
          rel="noreferrer"
          target="_blank"
        >
          Baixar texto base
        </a>
        <a
          className="mj-model-button-gray inline-flex items-center justify-center"
          href={`${exportBaseHref}?format=pdf`}
          rel="noreferrer"
          target="_blank"
        >
          Abrir PDF
        </a>
        <button
          className="mj-model-button-gray"
          type="button"
          onClick={() => {
            window.print();
          }}
        >
          Imprimir minuta
        </button>
      </div>
    </div>
  );
}
