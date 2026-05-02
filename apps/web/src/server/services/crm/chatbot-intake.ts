import { z } from "zod";

export const crmChatbotIntakeSchema = z.object({
  channel: z.string().min(1, "Informe o canal do intake."),
  leadName: z.string().min(1, "Informe o nome do lead."),
  leadSource: z.string().min(1, "Informe a origem do lead."),
  bankName: z.string().min(1, "Informe o banco do lead."),
  phone: z.string().min(1, "Informe um telefone de contato."),
  email: z.string().email("Informe um e-mail valido.").optional().or(z.literal("")),
  summary: z.string().min(1, "Informe um resumo do atendimento."),
  consent: z.boolean(),
  hasSignedContract: z.boolean().default(false)
});

export type CrmChatbotIntakePayload = z.infer<typeof crmChatbotIntakeSchema>;

export type CrmChatbotIntakeRecord = {
  intakeId: string;
  channel: string;
  leadName: string;
  sourceLabel: string;
  bankName: string;
  summary: string;
  consent: boolean;
  signedContract: boolean;
  stageLabel: string;
  pipelineLabel: string;
  nextAction: string;
  statusLabel: "accepted" | "review";
  payloadEcho: CrmChatbotIntakePayload;
};

function buildStageLabel(payload: CrmChatbotIntakePayload) {
  if (payload.hasSignedContract) {
    return "Contrato fechado";
  }

  return "Lead captado pelo chatbot";
}

function buildPipelineLabel(payload: CrmChatbotIntakePayload) {
  if (payload.hasSignedContract) {
    return "Contrato fechado";
  }

  return "Novo lead";
}

function buildNextAction(payload: CrmChatbotIntakePayload) {
  if (payload.hasSignedContract) {
    return "Abrir o novo atendimento bancario e formalizar o caso.";
  }

  return "Classificar o lead, agendar follow-up e abrir o caso quando houver autorizacao.";
}

export function normalizeCrmChatbotIntake(
  payload: CrmChatbotIntakePayload
): CrmChatbotIntakeRecord {
  return {
    intakeId: `chatbot-${Date.now()}`,
    channel: payload.channel,
    leadName: payload.leadName,
    sourceLabel: payload.leadSource,
    bankName: payload.bankName,
    summary: payload.summary,
    consent: payload.consent,
    signedContract: payload.hasSignedContract,
    stageLabel: buildStageLabel(payload),
    pipelineLabel: buildPipelineLabel(payload),
    nextAction: buildNextAction(payload),
    statusLabel: payload.consent ? "accepted" : "review",
    payloadEcho: payload
  };
}
