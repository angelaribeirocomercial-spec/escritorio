"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCases } from "@/server/services/cases/get-cases";
import { getClientById } from "@/server/services/clients/get-clients";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function buildDeleteRedirect(message: string) {
  const params = new URLSearchParams({ error: message });

  return `/pessoas/clientes?${params.toString()}`;
}

export async function deleteClientCascadeAction(formData: FormData) {
  const session = await requireWorkspaceSession();
  const clientId = readText(formData, "clientId");

  if (!clientId) {
    redirect(buildDeleteRedirect("Nao foi possivel identificar o cliente para exclusao."));
  }

  if (!["owner", "admin"].includes(session.role)) {
    redirect(buildDeleteRedirect("Seu perfil nao tem permissao para excluir clientes."));
  }

  const client = await getClientById(clientId);

  if (!client) {
    redirect(buildDeleteRedirect("Nao foi possivel localizar o cliente para exclusao."));
  }

  const clientCases = await getCases({ clientId });
  const caseIds = clientCases.map((caseItem) => caseItem.id);
  const supabase = getSupabaseAdminClient();
  const tenantId = session.workspace.tenant.id;

  const { error: financialByClientError } = await supabase
    .from("financial_entries")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("client_id", clientId);

  if (financialByClientError) {
    redirect(buildDeleteRedirect(`Nao foi possivel limpar os lancamentos financeiros do cliente: ${financialByClientError.message}`));
  }

  if (caseIds.length > 0) {
    const { error: financialByCaseError } = await supabase
      .from("financial_entries")
      .delete()
      .eq("tenant_id", tenantId)
      .in("case_id", caseIds);

    if (financialByCaseError) {
      redirect(buildDeleteRedirect(`Nao foi possivel limpar os lancamentos financeiros vinculados aos casos: ${financialByCaseError.message}`));
    }
  }

  const { error: leadsByClientError } = await supabase
    .from("crm_leads")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("client_id", clientId);

  if (leadsByClientError) {
    redirect(buildDeleteRedirect(`Nao foi possivel limpar os leads do cliente: ${leadsByClientError.message}`));
  }

  if (caseIds.length > 0) {
    const { error: leadsByCaseError } = await supabase
      .from("crm_leads")
      .delete()
      .eq("tenant_id", tenantId)
      .in("case_id", caseIds);

    if (leadsByCaseError) {
      redirect(buildDeleteRedirect(`Nao foi possivel limpar os leads vinculados aos casos: ${leadsByCaseError.message}`));
    }
  }

  if (caseIds.length > 0) {
    const { error: casesError } = await supabase
      .from("cases")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("client_id", clientId);

    if (casesError) {
      redirect(buildDeleteRedirect(`Nao foi possivel excluir os casos derivados do cliente: ${casesError.message}`));
    }
  }

  const { error: clientError } = await supabase
    .from("clients")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("id", clientId);

  if (clientError) {
    redirect(buildDeleteRedirect(`Nao foi possivel excluir o cliente: ${clientError.message}`));
  }

  revalidatePath("/pessoas/clientes");
  revalidatePath("/crm");
  revalidatePath("/crm/conversas");
  revalidatePath("/crm/pipeline");
  revalidatePath("/crm/contratos");
  revalidatePath("/crm/conversao");
  revalidatePath("/processos");
  revalidatePath("/documentos/meus-arquivos");
  revalidatePath("/agenda/compromissos");
  revalidatePath("/agenda/prazos");
  revalidatePath("/agenda/tarefas");
  revalidatePath("/financeiro/despesas");
  revalidatePath("/financeiro/receitas");
  revalidatePath("/financeiro/transferencias");
  revalidatePath("/financeiro/vencimentos");
  revalidatePath("/clara");
  revalidatePath("/editor-de-texto/meus-textos");
  revalidatePath("/editor-de-texto/distribuicao");
  revalidatePath("/novo-atendimento-bancario");

  redirect("/pessoas/clientes?deleted=1");
}
