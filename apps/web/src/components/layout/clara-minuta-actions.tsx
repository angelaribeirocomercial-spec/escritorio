"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ClaraMinutaActionsProps = {
  recordId: string;
};

export function ClaraMinutaActions({ recordId }: ClaraMinutaActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, startTransition] = useTransition();
  const exportBaseHref = `/api/clara/minutas/${recordId}/exportacao`;

  function simulateDistribution() {
    setError(null);
    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch(`/api/clara/minutas/${recordId}`, {
            body: JSON.stringify({ workflowStatus: "completed" }),
            headers: {
              "Content-Type": "application/json"
            },
            method: "PATCH"
          });

          if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as { error?: string } | null;
            setError(payload?.error ?? "Nao foi possivel marcar a minuta como pronta para distribuir.");
            return;
          }

          router.refresh();
        } catch {
          setError("Nao foi possivel marcar a minuta como pronta para distribuir.");
        }
      })();
    });
  }

  return (
    <div className="mt-4 space-y-3 rounded-[4px] border bg-black/10 px-4 py-4 mj-model-gridline">
      <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        Saida final da minuta
      </p>
      <p className="text-[13px] leading-6 text-slate-300">
        O PDF abaixo e a simulacao final ficam no mesmo bloco. Nenhuma distribuicao real acontece aqui.
      </p>
      {error ? <p className="text-[13px] text-red-200">{error}</p> : null}
      <div className="grid gap-3 md:grid-cols-4">
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
          className="mj-model-button-green"
          disabled={isSimulating}
          type="button"
          onClick={simulateDistribution}
        >
          {isSimulating ? "Simulando..." : "Marcar como pronto para distribuir"}
        </button>
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
