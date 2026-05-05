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
      const response = await fetch(`/api/clientes/${clientId}`, {
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
    <div className="flex flex-col gap-2">
      <button className="detail-danger-button px-4 py-3 text-sm font-semibold" disabled={isDeleting} type="button" onClick={handleDelete}>
        {isDeleting ? "Excluindo..." : "Excluir cliente"}
      </button>
      <p className="text-[11px] leading-5 text-red-100/80">
        Remove cliente, casos, documentos, tarefas, leads e fluxos derivados do tenant ativo.
      </p>
      {error ? <p className="text-[11px] leading-5 text-red-100">{error}</p> : null}
    </div>
  );
}
