import { NextRequest, NextResponse } from "next/server";

import { getWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCases } from "@/server/services/cases/get-cases";
import { getClientById } from "@/server/services/clients/get-clients";

type RouteContext = {
  params: {
    id: string;
  };
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await getWorkspaceSession();

  if (!session) {
    return jsonError("Sessao de workspace ausente.", 401);
  }

  if (!["owner", "admin"].includes(session.role)) {
    return jsonError("Seu perfil nao tem permissao para excluir clientes.", 403);
  }

  const clientId = context.params.id;
  const client = await getClientById(clientId);

  if (!client) {
    return jsonError("Cliente nao encontrado.", 404);
  }

  const clientCases = await getCases({ clientId });
  const caseIds = clientCases.map((caseItem) => caseItem.id);
  const supabase = getSupabaseAdminClient();
  const tenantId = session.workspace.tenant.id;

  try {
    const deleteFinancialEntries = async (predicate: { client?: string; caseIds?: string[] }) => {
      let query = supabase.from("financial_entries").delete().eq("tenant_id", tenantId);

      if (predicate.client) {
        query = query.eq("client_id", predicate.client);
      }

      if (predicate.caseIds?.length) {
        query = query.in("case_id", predicate.caseIds);
      }

      const { error } = await query;

      if (error) {
        throw new Error(`Nao foi possivel limpar os lancamentos financeiros: ${error.message}`);
      }
    };

    const deleteCrmLeads = async (predicate: { client?: string; caseIds?: string[] }) => {
      let query = supabase.from("crm_leads").delete().eq("tenant_id", tenantId);

      if (predicate.client) {
        query = query.eq("client_id", predicate.client);
      }

      if (predicate.caseIds?.length) {
        query = query.in("case_id", predicate.caseIds);
      }

      const { error } = await query;

      if (error) {
        throw new Error(`Nao foi possivel limpar os leads do CRM: ${error.message}`);
      }
    };

    await deleteFinancialEntries({ client: clientId });
    if (caseIds.length > 0) {
      await deleteFinancialEntries({ caseIds });
    }

    await deleteCrmLeads({ client: clientId });
    if (caseIds.length > 0) {
      await deleteCrmLeads({ caseIds });
    }

    const { error: casesError } = await supabase
      .from("cases")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("client_id", clientId);

    if (casesError) {
      throw new Error(`Nao foi possivel excluir os casos derivados do cliente: ${casesError.message}`);
    }

    const { error: clientError } = await supabase
      .from("clients")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("id", clientId);

    if (clientError) {
      throw new Error(`Nao foi possivel excluir o cliente: ${clientError.message}`);
    }
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Nao foi possivel excluir o cliente.");
  }

  return NextResponse.json({
    ok: true,
    clientId,
    deletedCases: caseIds.length
  });
}
