"use client";

type ClaraMinutaActionsProps = {
  recordId: string;
};

export function ClaraMinutaActions({ recordId }: ClaraMinutaActionsProps) {
  const exportBaseHref = `/api/clara/minutas/${recordId}/exportacao`;

  return (
    <div className="mt-4 grid gap-3 rounded-[4px] border bg-black/10 px-4 py-4 mj-model-gridline md:grid-cols-3">
      <a
        className="mj-model-button-green inline-flex items-center justify-center"
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
  );
}
