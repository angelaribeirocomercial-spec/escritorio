"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BANKING_NICHES, BankingNiche, getBankingNicheLabel } from "@lexia/domain";

import { requireWorkspaceSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildBankingCaseOperationalTaskState,
  buildPersistedBankingCaseLifecycle
} from "@/server/services/cases/get-banking-case-workflow";
import {
  TENANT_DOCUMENT_BUCKET,
  uploadTenantDocument
} from "@/server/services/documents/upload-tenant-document";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function readFile(formData: FormData, key: string) {
  const value = formData.get(key);

  return value instanceof File && value.size > 0 ? value : null;
}

function isBankingNiche(value: string): value is BankingNiche {
  return BANKING_NICHES.some((entry) => entry.value === value);
}

type IntakeDocumentSlot = {
  key: string;
  field: string;
  label: string;
  category: string;
  tags: readonly string[];
};

const DOCUMENT_SLOTS: readonly IntakeDocumentSlot[] = [
  {
    key: "personal-document",
    field: "personalDocumentFile",
    label: "Documento pessoal do cliente",
    category: "Identificacao",
    tags: ["cliente", "identificacao"]
  },
  {
    key: "address-proof",
    field: "addressProofFile",
    label: "Comprovante de residencia",
    category: "Cadastro",
    tags: ["cliente", "residencia"]
  },
  {
    key: "contract",
    field: "contractFile",
    label: "Contrato bancario ou CCB",
    category: "Contratos",
    tags: ["contrato", "bancario"]
  },
  {
    key: "payments",
    field: "paymentsProofFile",
    label: "Comprovantes de pagamento",
    category: "Financeiro",
    tags: ["pagamento", "parcelas"]
  },
  {
    key: "debt-history",
    field: "debtHistoryFile",
    label: "Planilha ou historico das parcelas",
    category: "Financeiro",
    tags: ["planilha", "parcelas"]
  },
  {
    key: "benefit-statement",
    field: "benefitStatementFile",
    label: "Extrato do beneficio ou extrato bancario",
    category: "Extratos",
    tags: ["extrato", "beneficio"]
  },
  {
    key: "bank-communication",
    field: "bankCommunicationFile",
    label: "Comunicacoes com o banco",
    category: "Provas",
    tags: ["banco", "protocolo"]
  },
  {
    key: "vehicle-document",
    field: "vehicleDocumentFile",
    label: "Documento do veiculo",
    category: "Veiculo",
    tags: ["veiculo", "crlv"]
  },
  {
    key: "default-notice",
    field: "defaultNoticeFile",
    label: "Notificacao de mora",
    category: "Notificacoes",
    tags: ["mora", "notificacao"]
  }
] as const;

const REQUIRED_DOCUMENT_SLOT_KEYS: Record<BankingNiche, readonly string[]> = {
  revisional: ["personal-document", "address-proof", "contract"],
  fraude: ["personal-document", "benefit-statement", "bank-communication"],
  "busca-apreensao": ["personal-document", "contract", "vehicle-document", "default-notice"]
};

function getDocumentSlot(slotKey: string) {
  return DOCUMENT_SLOTS.find((slot) => slot.key === slotKey) ?? null;
}

function getRequiredDocumentSlots(niche: BankingNiche) {
  return REQUIRED_DOCUMENT_SLOT_KEYS[niche]
    .map((slotKey) => getDocumentSlot(slotKey))
    .filter((slot): slot is IntakeDocumentSlot => slot !== null);
}

function buildValidationRedirect(message: string) {
  const params = new URLSearchParams({ error: message });

  return `/novo-atendimento-bancario?${params.toString()}`;
}

function buildCaseTitle(niche: BankingNiche, bankName: string) {
  switch (niche) {
    case "fraude":
      return `Fraude bancaria contra ${bankName}`;
    case "busca-apreensao":
      return `Busca e apreensao vinculada a ${bankName}`;
    default:
      return `Revisional de contrato com ${bankName}`;
  }
}

function buildClaimType(niche: BankingNiche) {
  switch (niche) {
    case "fraude":
      return "fraude_bancaria";
    case "busca-apreensao":
      return "busca_apreensao";
    default:
      return "acao_revisional";
  }
}

function buildStage(niche: BankingNiche) {
  switch (niche) {
    case "fraude":
      return "Triagem de fraude";
    case "busca-apreensao":
      return "Triagem de busca e apreensao";
    default:
      return "Analise contratual inicial";
  }
}

function buildMainThesis(niche: BankingNiche, objective: string) {
  if (objective) {
    return objective;
  }

  switch (niche) {
    case "fraude":
      return "Falha de seguranca e contratacao nao autorizada";
    case "busca-apreensao":
      return "Mora controvertida e preservacao do veiculo";
    default:
      return "Juros abusivos e revisao contratual";
  }
}

function buildSuggestedStrategy(niche: BankingNiche, objective: string) {
  if (niche === "fraude") {
    return "Fechar cronologia, reforcar a prova e estruturar a estrategia de resposta contra a fraude bancaria.";
  }

  if (niche === "busca-apreensao") {
    return "Consolidar contrato, mora e urgencia para estruturar a defesa e a protecao do veiculo.";
  }

  return objective
    ? `Consolidar documentos, memoria inicial e estrategia revisional com foco em ${objective.toLowerCase()}.`
    : "Consolidar contrato, documentos e memoria inicial para abrir a estrategia revisional.";
}

function buildInitialTimeline(clientName: string, niche: BankingNiche) {
  return [
    `Atendimento bancario iniciado para ${clientName}.`,
    `Nicho selecionado: ${getBankingNicheLabel(niche)}.`,
    "Caso aberto pela entrada unica do escritorio."
  ];
}

function buildClientContext(bankName: string, niche: BankingNiche, objective: string) {
  const nicheLabel = getBankingNicheLabel(niche);
  const objectiveLine = objective ? ` Objetivo inicial: ${objective}.` : "";

  return `Cliente em onboarding do nicho ${nicheLabel} com banco ${bankName}.${objectiveLine}`;
}

function buildInitialTasks(params: {
  clientId: string;
  caseId: string;
  niche: BankingNiche;
  stage: string;
  caseTitle: string;
  objective: string;
  assigneeLabel: string;
  uploadedDocumentLabels: readonly string[];
}) {
  const dueDateBase = new Date();
  const firstDueDate = new Date(dueDateBase);
  firstDueDate.setDate(firstDueDate.getDate() + 1);
  const secondDueDate = new Date(dueDateBase);
  secondDueDate.setDate(secondDueDate.getDate() + 2);
  const checklistTaskState = buildBankingCaseOperationalTaskState({
    niche: params.niche,
    stage: params.stage,
    documentLabels: params.uploadedDocumentLabels
  });

  return [
    {
      id: `task-${randomUUID()}`,
      client_id: params.clientId,
      case_id: params.caseId,
      title: "Fechar checklist documental inicial",
      description: `Consolidar a base minima do caso ${params.caseTitle} para liberar a leitura juridica do nicho.`,
      assignee_label: params.assigneeLabel,
      due_date: firstDueDate.toISOString().slice(0, 10),
      priority: "urgent",
      status: checklistTaskState.status,
      notes: checklistTaskState.notes,
      checklist: checklistTaskState.checklist,
      suggested_by_claim_type:
        params.niche === "fraude"
          ? "fraude_bancaria"
          : params.niche === "busca-apreensao"
            ? "busca_apreensao"
            : "acao_revisional",
      lexia_next_step: checklistTaskState.nextStep
    },
    {
      id: `task-${randomUUID()}`,
      client_id: params.clientId,
      case_id: params.caseId,
      title: "Consolidar estrategia inicial do caso",
      description: "Validar o objetivo inicial, ajustar a tese principal e registrar o proximo passo do caso.",
      assignee_label: params.assigneeLabel,
      due_date: secondDueDate.toISOString().slice(0, 10),
      priority: "high",
      status: "todo",
      notes: params.objective
        ? `Objetivo inicial informado no onboarding: ${params.objective}.`
        : "Objetivo inicial ainda precisa de refinamento humano.",
      checklist: [
        {
          id: `item-${randomUUID()}`,
          label: "Validar objetivo inicial do caso",
          done: Boolean(params.objective)
        },
        {
          id: `item-${randomUUID()}`,
          label: "Confirmar tese principal e proxima fase do workflow",
          done: false
        }
      ],
      suggested_by_claim_type:
        params.niche === "fraude"
          ? "fraude_bancaria"
          : params.niche === "busca-apreensao"
            ? "busca_apreensao"
            : "acao_revisional",
      lexia_next_step: "Transformar o onboarding em leitura inicial do caso e travar a proxima etapa do workflow."
    }
  ] as const;
}

export async function createBankingIntakeAction(formData: FormData) {
  const session = await requireWorkspaceSession();

  if (!["owner", "admin"].includes(session.role)) {
    throw new Error("Only owners and admins can open a new banking intake.");
  }

  const fullName = readText(formData, "fullName");
  const documentId = readText(formData, "documentId");
  const email = readText(formData, "email");
  const phone = readText(formData, "phone");
  const whatsapp = readText(formData, "whatsapp") || phone;
  const address = readText(formData, "address");
  const leadSource = readText(formData, "leadSource") || "Clara";
  const bankName = readText(formData, "bankName");
  const nicheValue = readText(formData, "niche");
  const objective = readText(formData, "objective");
  const contractNumber = readText(formData, "contractNumber");
  const notes = readText(formData, "notes");

  if (!fullName || !documentId || !email || !phone || !address || !bankName || !nicheValue) {
    redirect(buildValidationRedirect("Preencha os campos obrigatorios de cliente, caso e nicho antes de iniciar o caso."));
  }

  if (!isBankingNiche(nicheValue)) {
    redirect(buildValidationRedirect("Selecione um nicho bancario valido."));
  }

  const niche = nicheValue;
  const requiredDocumentSlots = getRequiredDocumentSlots(niche);
  const missingRequiredFields = requiredDocumentSlots.filter((slot) => !readFile(formData, slot.field));

  if (missingRequiredFields.length > 0) {
    redirect(
      buildValidationRedirect(
        `Anexe os documentos essenciais desta etapa: ${missingRequiredFields.map((slot) => slot.label).join(", ")}.`
      )
    );
  }

  const clientId = `cl-${randomUUID()}`;
  const caseId = `case-${randomUUID()}`;
  const caseTitle = buildCaseTitle(niche, bankName);
  const caseStage = buildStage(niche);
  const mainThesis = buildMainThesis(niche, objective);
  const suggestedStrategy = buildSuggestedStrategy(niche, objective);
  const processNumber = `pendente-distribuicao-${Date.now()}`;
  const clientTimeline = buildInitialTimeline(fullName, niche);
  const linkedCaseSummary = [
    {
      id: caseId,
      title: caseTitle,
      status: caseStage,
      thesis: mainThesis
    }
  ];
  const uploadedDocumentIds: string[] = [];
  const uploadedStoragePaths: string[] = [];

  const supabase = getSupabaseServerClient();

  const { error: clientError } = await supabase.from("clients").insert({
    id: clientId,
    tenant_id: session.workspace.tenant.id,
    full_name: fullName,
    document_id: documentId,
    email,
    phone,
    whatsapp,
    address,
    lead_source: leadSource,
    bank_name: bankName,
    service_status: "triage",
    signed_contract: false,
    legal_viability_score: 8,
    fees_label: "A definir",
    documents_sent: 0,
    notes: notes || "Cliente criado pela entrada unica do atendimento bancario.",
    ia_context: buildClientContext(bankName, niche, objective),
    linked_cases: linkedCaseSummary,
    linked_documents: [],
    timeline: clientTimeline
  });

  if (clientError) {
    redirect(buildValidationRedirect(`Nao foi possivel criar o cliente: ${clientError.message}`));
  }

  const initialLifecycle = buildPersistedBankingCaseLifecycle({
    niche,
    stage: caseStage,
    documentLabels: []
  });

  const { error: caseError } = await supabase.from("cases").insert({
    id: caseId,
    tenant_id: session.workspace.tenant.id,
    client_id: clientId,
    title: caseTitle,
    bank_name: bankName,
    process_number: processNumber,
    contract_number: contractNumber || `contrato-pendente-${Date.now()}`,
    claim_type: buildClaimType(niche),
    stage: caseStage,
    status: "draft",
    amount_in_dispute: 0,
    estimated_value: 0,
    main_thesis: mainThesis,
    legal_risk: "medium",
    suggested_strategy: suggestedStrategy,
    owner_label: session.email ?? "Equipe do escritorio",
    niche,
    linked_documents: [],
    linked_tasks: [],
    linked_deadlines: [],
    lexia_insights: [
      `Caso iniciado pela entrada unica do nicho ${getBankingNicheLabel(niche)}.`,
      objective ? `Objetivo inicial registrado: ${objective}.` : "Objetivo inicial pendente de refinamento."
    ],
    workflow_state: initialLifecycle.workflowState,
    checklist_state: initialLifecycle.checklistState
  });

  if (caseError) {
    await supabase.from("clients").delete().eq("tenant_id", session.workspace.tenant.id).eq("id", clientId);
    redirect(buildValidationRedirect(`Nao foi possivel criar o caso bancario: ${caseError.message}`));
  }

  try {
    for (const slot of DOCUMENT_SLOTS) {
      const file = readFile(formData, slot.field);

      if (!file) {
        continue;
      }

      const uploadedDocument = await uploadTenantDocument({
        tenantId: session.workspace.tenant.id,
        clientId,
        caseId,
        file,
        documentType: slot.label,
        category: slot.category,
        summary: `Documento recebido no onboarding do nicho ${getBankingNicheLabel(niche)}.`,
        tags: slot.tags
      });

      uploadedDocumentIds.push(uploadedDocument.documentId);
      uploadedStoragePaths.push(uploadedDocument.storagePath);
    }

    const uploadedDocumentLabels = DOCUMENT_SLOTS.filter((slot) => readFile(formData, slot.field) !== null).map(
      (slot) => slot.label
    );
    const lifecycleState = buildPersistedBankingCaseLifecycle({
      niche,
      stage: caseStage,
      documentLabels: uploadedDocumentLabels
    });
    const initialTasks = buildInitialTasks({
      clientId,
      caseId,
      niche,
      stage: caseStage,
      caseTitle,
      objective,
      assigneeLabel: session.email ?? "Equipe do escritorio",
      uploadedDocumentLabels
    });

    const { error: taskError } = await supabase.from("tasks").insert(
      initialTasks.map((task) => ({
        tenant_id: session.workspace.tenant.id,
        ...task
      }))
    );

    if (taskError) {
      throw new Error(`Nao foi possivel criar as tarefas iniciais do caso: ${taskError.message}`);
    }

    const taskIds = initialTasks.map((task) => task.id);

    const { error: updateCaseError } = await supabase
      .from("cases")
      .update({
        linked_documents: uploadedDocumentIds,
        linked_tasks: taskIds,
        status: "active",
        workflow_state: lifecycleState.workflowState,
        checklist_state: lifecycleState.checklistState
      })
      .eq("tenant_id", session.workspace.tenant.id)
      .eq("id", caseId);

    if (updateCaseError) {
      throw new Error(`Nao foi possivel atualizar os vinculos do caso: ${updateCaseError.message}`);
    }

    const timeline = [
      ...clientTimeline,
      `${uploadedDocumentIds.length} documento(s) essencial(is) anexado(s) na abertura do caso.`,
      `${taskIds.length} tarefa(s) inicial(is) criada(s) para o workflow do nicho.`
    ];

    const { error: updateClientError } = await supabase
      .from("clients")
      .update({
        linked_documents: uploadedDocumentIds,
        documents_sent: uploadedDocumentIds.length,
        service_status: "active",
        timeline
      })
      .eq("tenant_id", session.workspace.tenant.id)
      .eq("id", clientId);

    if (updateClientError) {
      throw new Error(`Nao foi possivel atualizar o cliente com o onboarding completo: ${updateClientError.message}`);
    }
  } catch (error) {
    await supabase.from("tasks").delete().eq("tenant_id", session.workspace.tenant.id).eq("case_id", caseId);
    if (uploadedDocumentIds.length > 0) {
      await supabase.from("documents").delete().eq("tenant_id", session.workspace.tenant.id).in("id", uploadedDocumentIds);
    }
    if (uploadedStoragePaths.length > 0) {
      await supabase.storage.from(TENANT_DOCUMENT_BUCKET).remove(uploadedStoragePaths);
    }
    await supabase.from("cases").delete().eq("tenant_id", session.workspace.tenant.id).eq("id", caseId);
    await supabase.from("clients").delete().eq("tenant_id", session.workspace.tenant.id).eq("id", clientId);

    redirect(
      buildValidationRedirect(
        error instanceof Error
          ? error.message
          : "Nao foi possivel concluir o novo atendimento bancario."
      )
    );
  }

  revalidatePath("/pessoas/clientes");
  revalidatePath(`/pessoas/clientes/${clientId}`);
  revalidatePath("/tarefas");
  revalidatePath("/documentos/meus-arquivos");
  revalidatePath("/clara");
  redirect(`/pessoas/clientes/${clientId}?case=${caseId}&onboarding=1&workflow=1`);
}
