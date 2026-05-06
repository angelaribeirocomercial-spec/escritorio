"use client";

import Link from "next/link";

type ClaraMinutaActionsProps = {
  recordId: string;
};

export function ClaraMinutaActions({ recordId }: ClaraMinutaActionsProps) {
  const exportBaseHref = `/api/clara/minutas/${recordId}/exportacao`;
  const handoffHref = `/editor-de-texto/distribuicao?record=${encodeURIComponent(recordId)}&handoff=1`;

  return (
    <div className="mt-4 space-y-3 rounded-[4px] border bg-black/10 px-4 py-4 mj-model-gridline">
      <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        Handoff de distribuicao
      </p>
      <p className="text-[13px] leading-6 text-slate-300">
        O PDF abaixo e a revisao final ficam no mesmo bloco. Se a intencao for distribuir, siga direto para a
        superficie propria de handoff.
      </p>
      <div className="grid gap-3 md:grid-cols-4">
        <Link className="mj-model-button-green inline-flex items-center justify-center" href={handoffHref}>
          Pronto para distribuir
        </Link>
        <a
          className="mj-model-button-gray inline-flex items-center justify-center"
          href={`${exportBaseHref}?format=docx`}
          rel="noreferrer"
          target="_blank"
        >
          Abrir DOCX
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
