"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteClientButtonProps = {
  clientId: string;
  clientName: string;
  caseCount: number;
};

export function DeleteClientButton({ clientId, clientName, caseCount }: DeleteClientButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmationMessage =
    caseCount > 0
      ? `Excluir ${clientName} e todos os fluxos gerados a partir dele?`
      : `Excluir ${clientName}?`;

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    if (typeof window !== "undefined" && !window.confirm(confirmationMessage)) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/clientes/${clientId}/excluir`, {
        method: "DELETE"
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Nao foi possivel excluir o cliente.");
        return;
      }

      router.push("/pessoas/clientes?deleted=1");
      router.refresh();
    } catch {
      setError("Nao foi possivel excluir o cliente.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        className="detail-danger-button inline-flex items-center justify-center px-3 py-2 text-xs font-semibold"
        disabled={isDeleting}
        type="button"
        onClick={handleDelete}
      >
        {isDeleting ? "Excluindo..." : "Excluir cliente"}
      </button>
      <p className="max-w-[16rem] text-[10px] leading-4 text-red-100/75">
        Remove cliente, casos, documentos, tarefas, leads e fluxos derivados.
      </p>
      {error ? <p className="text-[11px] leading-5 text-red-100">{error}</p> : null}
    </div>
  );
}
