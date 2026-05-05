"use client";

import { deleteClientCascadeAction } from "@/app/(workspace)/pessoas/clientes/[clientId]/actions";

type DeleteClientButtonProps = {
  clientId: string;
  clientName: string;
  caseCount: number;
};

export function DeleteClientButton({ clientId, clientName, caseCount }: DeleteClientButtonProps) {
  const confirmationMessage =
    caseCount > 0
      ? `Excluir ${clientName} e todos os fluxos gerados a partir dele?`
      : `Excluir ${clientName}?`;

  return (
    <form
      action={deleteClientCascadeAction as any}
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        if (typeof window !== "undefined" && !window.confirm(confirmationMessage)) {
          event.preventDefault();
          return;
        }
      }}
    >
      <input name="clientId" type="hidden" value={clientId} />
      <button
        className="detail-danger-button px-4 py-3 text-sm font-semibold"
        type="submit"
      >
        Excluir cliente
      </button>
      <p className="text-[11px] leading-5 text-red-100/80">
        Remove cliente, casos, documentos, tarefas, leads e fluxos derivados do tenant ativo.
      </p>
    </form>
  );
}
