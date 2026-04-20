export type WorkspaceModule =
  | "dashboard"
  | "clientes"
  | "casos"
  | "processos"
  | "diario-oficial"
  | "andamentos"
  | "agenda"
  | "documentos"
  | "tarefas"
  | "lexia";

export type UserRole = "owner" | "admin" | "lawyer" | "assistant";

export type TenantPlan = "trial" | "starter" | "pro";

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
}

export interface MembershipSummary {
  id: string;
  userId: string;
  tenantId: string;
  role: UserRole;
  isActive: boolean;
}

export type ClientServiceStatus =
  | "triage"
  | "active"
  | "waiting-docs"
  | "closed";

export interface ClientLinkedCaseSummary {
  id: string;
  title: string;
  status: string;
  thesis: string;
}

export interface ClientRecord {
  id: string;
  fullName: string;
  documentId: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  leadSource: string;
  bankName: string;
  serviceStatus: ClientServiceStatus;
  signedContract: boolean;
  legalViabilityScore: number;
  feesLabel: string;
  documentsSent: number;
  notes: string;
  iaContext: string;
  linkedCases: readonly ClientLinkedCaseSummary[];
  linkedDocuments: readonly string[];
  timeline: readonly string[];
}

export type BankingCaseStatus = "draft" | "active" | "awaiting-action" | "closed";
export type BankingCaseRisk = "low" | "medium" | "high";

export interface BankingCaseRecord {
  id: string;
  clientId: string;
  title: string;
  bankName: string;
  processNumber: string;
  contractNumber: string;
  claimType: string;
  stage: string;
  status: BankingCaseStatus;
  amountInDispute: number;
  estimatedValue: number;
  mainThesis: string;
  legalRisk: BankingCaseRisk;
  suggestedStrategy: string;
  ownerLabel: string;
  linkedDocuments: readonly string[];
  linkedTasks: readonly string[];
  linkedDeadlines: readonly string[];
  lexiaInsights: readonly string[];
}

export type JudicialProcessStatus =
  | "monitoring"
  | "awaiting-filing"
  | "active"
  | "stayed"
  | "closed";

export type JudicialProcessCriticality = "low" | "medium" | "high";

export interface JudicialTimelineItem {
  id: string;
  occurredAt: string;
  title: string;
  description: string;
  source: string;
  criticality: JudicialProcessCriticality;
}

export interface JudicialProcessRecord {
  id: string;
  caseId: string;
  clientId: string;
  processNumber: string;
  tribunal: string;
  courtDistrict: string;
  courtName: string;
  proceduralPhase: string;
  status: JudicialProcessStatus;
  responsibleLawyer: string;
  monitoringMode: "manual" | "oab" | "court";
  latestTimeline: readonly JudicialTimelineItem[];
}

export type OfficialDiaryUrgency = "low" | "medium" | "high";

export interface OfficialDiaryPublicationRecord {
  id: string;
  processId: string;
  caseId: string;
  clientId: string;
  publishedAt: string;
  sourceCourt: string;
  sourceLabel: string;
  title: string;
  rawContext: string;
  bankingSummary: string;
  requiredAction: string;
  urgency: OfficialDiaryUrgency;
  responsibleLawyer: string;
  suggestedTaskTitle: string;
  suggestedTaskDescription: string;
}

export type ProceduralUpdateCriticality = "low" | "medium" | "high";

export interface ProceduralUpdateRecord {
  id: string;
  processId: string;
  caseId: string;
  clientId: string;
  occurredAt: string;
  movementType: string;
  sourceCourt: string;
  sourceLabel: string;
  rawMovement: string;
  operationalSummary: string;
  criticality: ProceduralUpdateCriticality;
  claraImpactSummary: string;
  claraCaution: string;
  claraNextActions: readonly string[];
}

export type AgendaViewMode = "day" | "week" | "month";

export interface AgendaCommitmentRecord {
  id: string;
  clientId?: string;
  caseId?: string;
  processId?: string;
  title: string;
  description: string;
  scheduledFor: string;
  responsibleLabel: string;
  locationLabel: string;
  category: "hearing" | "client-follow-up" | "internal-review" | "meeting";
}

export interface ProceduralDeadlineRecord {
  id: string;
  clientId: string;
  caseId: string;
  processId?: string;
  title: string;
  description: string;
  dueDate: string;
  responsibleLabel: string;
  sourceLabel: string;
  severity: "low" | "medium" | "high";
}

export type DocumentAiStatus = "not_analyzed" | "analyzed" | "needs_review";

export interface DocumentRecord {
  id: string;
  clientId: string;
  caseId: string;
  fileName: string;
  documentType: string;
  category: string;
  tags: readonly string[];
  aiStatus: DocumentAiStatus;
  summary: string;
  pageCount: number;
  uploadedAt: string;
  previewLabel: string;
  actions: readonly string[];
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface TaskChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface TaskRecord {
  id: string;
  clientId: string;
  caseId: string;
  title: string;
  description: string;
  assigneeLabel: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  notes: string;
  checklist: readonly TaskChecklistItem[];
  suggestedByClaimType: string;
  lexiaNextStep: string;
}

export type LexiaMode =
  | "atendimento"
  | "analise"
  | "producao_juridica"
  | "operacional";

export interface LexiaResponseFixture {
  id: string;
  contextKey: string;
  title: string;
  mode: LexiaMode;
  prompt: string;
  contextBasis: readonly string[];
  mainConclusion: string;
  facts: readonly string[];
  recommendations: readonly string[];
  nextActions: readonly string[];
  cautionLabel: string;
}

export interface ContractAnalysisRecord {
  id: string;
  documentId: string;
  rateLabel: string;
  cetLabel: string;
  capitalizationLabel: string;
  feesLabel: string;
  bundledInsuranceLabel: string;
  permanenceCommissionLabel: string;
  penaltyLabel: string;
  sensitiveClauses: readonly string[];
  abusivenessSignals: readonly string[];
  suggestedThesis: string;
  proceduralRisk: "low" | "medium" | "high";
  suggestedRequests: readonly string[];
  executiveSummary: string;
}
