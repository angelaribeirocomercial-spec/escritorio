const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

assert.equal(true, true);

[
  "src/app/(auth)/sign-in/actions.ts",
  "src/app/(auth)/sign-in/page.tsx",
  "src/app/(auth)/sign-in/sign-in-form.tsx",
  "src/app/(workspace)/layout.tsx",
  "src/app/(workspace)/dashboard/page.tsx",
  "src/app/(workspace)/crm/page.tsx",
  "src/app/(workspace)/crm/page.tsx",
  "src/app/(workspace)/crm/pipeline/page.tsx",
  "src/app/(workspace)/crm/contratos/page.tsx",
  "src/app/(workspace)/crm/conversas/page.tsx",
  "src/app/(workspace)/crm/conversao/page.tsx",
  "src/app/(workspace)/pessoas/page.tsx",
  "src/app/(workspace)/pessoas/clientes/page.tsx",
  "src/app/(workspace)/pessoas/adversos/page.tsx",
  "src/app/(workspace)/clientes/page.tsx",
  "src/app/(workspace)/clientes/[clientId]/page.tsx",
  "src/app/(workspace)/casos/page.tsx",
  "src/app/(workspace)/casos/[caseId]/page.tsx",
  "src/app/(workspace)/processos/page.tsx",
  "src/app/(workspace)/processos/lista/page.tsx",
  "src/app/(workspace)/processos/lixeira/page.tsx",
  "src/app/(workspace)/processos/ultimos-andamentos/page.tsx",
  "src/app/(workspace)/processos/importar-lote/page.tsx",
  "src/app/(workspace)/processos/importar-oab/page.tsx",
  "src/app/(workspace)/processos/[processId]/page.tsx",
  "src/app/(workspace)/diario-oficial/page.tsx",
  "src/app/(workspace)/diario-oficial/[publicationId]/page.tsx",
  "src/app/(workspace)/andamentos/page.tsx",
  "src/app/(workspace)/andamentos/[updateId]/page.tsx",
  "src/app/(workspace)/agenda/page.tsx",
  "src/app/(workspace)/agenda/compromissos/page.tsx",
  "src/app/(workspace)/agenda/tarefas/page.tsx",
  "src/app/(workspace)/agenda/prazos/page.tsx",
  "src/app/(workspace)/operacao/page.tsx",
  "src/app/(workspace)/financeiro/page.tsx",
  "src/app/(workspace)/financeiro/despesas/page.tsx",
  "src/app/(workspace)/financeiro/receitas/page.tsx",
  "src/app/(workspace)/financeiro/transferencias/page.tsx",
  "src/app/(workspace)/financeiro/vencimentos/page.tsx",
  "src/app/(workspace)/financeiro/graficos/page.tsx",
  "src/app/(workspace)/relatorios/page.tsx",
  "src/app/(workspace)/estatisticas/page.tsx",
  "src/app/(workspace)/documentos/page.tsx",
  "src/app/(workspace)/documentos/[documentId]/page.tsx",
  "src/app/(workspace)/documentos/enviar-arquivos/page.tsx",
  "src/app/(workspace)/documentos/relatorios/page.tsx",
  "src/app/api/clientes/[id]/route.ts",
  "src/app/api/casos/[id]/route.ts",
  "src/app/api/casos/[id]/documentos/route.ts",
  "src/app/api/casos/[id]/checklist/route.ts",
  "src/app/api/casos/[id]/modelos/route.ts",
  "src/app/api/clara/analisar-caso/route.ts",
  "src/app/api/clara/checklist-documental/route.ts",
  "src/app/api/clara/parecer-tecnico/route.ts",
  "src/app/api/clara/sugerir-proximo-passo/route.ts",
  "src/app/api/clara/resumir-andamentos/route.ts",
  "src/app/api/clara/gerar-peca/route.ts",
  "src/app/api/clara/historico/route.ts",
  "src/app/api/clara/minutas/route.ts",
  "src/app/api/clara/minutas/[recordId]/route.ts",
  "src/app/api/clara/minutas/[recordId]/exportacao/route.ts",
  "src/app/api/clara/revisar-minuta/route.ts",
  "src/app/api/clara/fontes/route.ts",
  "src/app/api/crm/chatbot-intake/route.ts",
  "src/app/api/processos/[numero]/datajud/route.ts",
  "src/app/api/bcb/tarifas/route.ts",
  "src/app/api/bcb/sgs/route.ts",
  "src/app/api/bcb/ptax/route.ts",
  "src/app/(workspace)/site/page.tsx",
  "src/app/(workspace)/site/[subpage]/page.tsx",
  "src/app/(workspace)/editor-de-texto/page.tsx",
  "src/app/(workspace)/analise-contrato/page.tsx",
  "src/app/(workspace)/configuracoes/integracoes/page.tsx",
  "src/app/(workspace)/tarefas/page.tsx",
  "src/app/(workspace)/tarefas/[taskId]/page.tsx",
  "src/app/(workspace)/lexia/page.tsx",
  "src/app/(workspace)/equipe/page.tsx",
  "src/app/(workspace)/configuracoes/page.tsx",
  "src/components/layout/workspace-navigation.ts",
  "src/components/layout/workspace-shell.tsx",
  "src/components/layout/clara-minuta-actions.tsx",
  "src/components/layout/lexia-context-actions.tsx",
  "src/components/layout/session-actions.tsx",
  "src/lib/branding/normalize-visible-copy.ts",
  "src/lib/auth/session.ts",
  "src/lib/supabase/client.ts",
  "src/lib/supabase/server.ts",
  "src/middleware.ts",
  "src/server/services/auth/workspace-context.ts",
  "src/server/services/dashboard/get-dashboard-summary.ts",
  "src/server/services/contract-analysis/get-contract-analysis.ts",
  "src/server/services/lexia/get-lexia-workspace.ts",
  "src/server/services/processes/get-processes.ts",
  "src/server/services/official-diary/get-official-diary.ts",
  "src/server/services/procedural-updates/get-procedural-updates.ts",
  "src/server/services/agenda/get-agenda-workspace.ts",
  "src/server/services/crm/get-crm-leads.ts",
  "src/server/services/crm/get-crm-pipeline.ts",
  "src/server/services/crm/get-crm-contracts.ts",
  "src/server/services/crm/get-crm-conversations.ts",
  "src/server/services/crm/get-crm-conversion.ts",
  "src/server/services/clara/get-clara-integrations.ts",
  "src/server/services/crm/chatbot-intake.ts",
  "src/server/services/datajud/get-datajud-process.ts",
  "src/server/services/bcb/get-bcb-consultation.ts",
  "src/server/services/clients/get-clients.ts",
  "src/server/services/cases/get-cases.ts",
  "src/server/services/documents/get-documents.ts",
  "src/server/services/documents/get-document-file-url.ts",
  "src/server/services/tasks/get-tasks.ts"
].forEach((relativePath) => {
  assert.equal(
    fs.existsSync(path.join(__dirname, "..", relativePath)),
    true,
    `Expected file to exist: ${relativePath}`
  );
});

const supabaseEnvSource = fs.readFileSync(
  path.join(__dirname, "..", "src/lib/supabase/env.ts"),
  "utf8"
);
assert.match(
  supabaseEnvSource,
  /throw new SupabaseConfigError/,
  "Expected Supabase env loader to fail explicitly when env is missing."
);
assert.match(
  supabaseEnvSource,
  /process\.env\.SUPABASE_URL/,
  "Expected Supabase env loader to accept server-side SUPABASE_URL aliases."
);
assert.match(
  supabaseEnvSource,
  /process\.env\.SUPABASE_ANON_KEY/,
  "Expected Supabase env loader to accept server-side SUPABASE_ANON_KEY aliases."
);
assert.doesNotMatch(
  supabaseEnvSource,
  /example\.supabase\.co|public-anon-key-placeholder/,
  "Expected Supabase env loader to avoid placeholder credentials."
);

const workspaceContextSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/auth/workspace-context.ts"),
  "utf8"
);
assert.match(
  workspaceContextSource,
  /getSupabaseAdminClient\(\)/,
  "Expected workspace context resolution to use the privileged Supabase admin client."
);
assert.match(
  workspaceContextSource,
  /No active workspace membership found/,
  "Expected workspace context resolution to fail explicitly when membership is missing."
);
assert.doesNotMatch(
  workspaceContextSource,
  /buildFallbackContext/,
  "Expected workspace context fallback to be removed."
);

const sessionSource = fs.readFileSync(
  path.join(__dirname, "..", "src/lib/auth/session.ts"),
  "utf8"
);
assert.match(
  sessionSource,
  /Configure%20NEXT_PUBLIC_SUPABASE_URL%20e%20NEXT_PUBLIC_SUPABASE_ANON_KEY/,
  "Expected protected routes to redirect with explicit Supabase configuration guidance."
);

const demoAccessSource = fs.readFileSync(
  path.join(__dirname, "..", "src/lib/auth/demo-access.ts"),
  "utf8"
);
assert.match(
  demoAccessSource,
  /import type \{ WorkspaceSession \}/,
  "Expected demo access to import the workspace session as a type-only dependency."
);
assert.match(
  demoAccessSource,
  /DEMO_TENANT_ID = "11111111-1111-1111-1111-111111111111"/,
  "Expected demo access to use the seeded demo tenant UUID."
);
assert.match(
  demoAccessSource,
  /DEMO_EMAIL = "owner@lexia-demo\.local"/,
  "Expected demo access to use the seeded Supabase demo account."
);
assert.match(
  demoAccessSource,
  /DEMO_VISIBLE_TENANT_NAME = "Clara Bancaria Demo"/,
  "Expected demo access to expose Clara as the visible tenant branding for the workspace."
);
assert.match(
  demoAccessSource,
  /DEMO_VISIBLE_EMAIL = "workspace\.demo@clara\.local"/,
  "Expected demo access to expose a Clara-aligned visible email label for the demo workspace."
);

const visibleCopySource = fs.readFileSync(
  path.join(__dirname, "..", "src/lib/branding/normalize-visible-copy.ts"),
  "utf8"
);
assert.match(
  visibleCopySource,
  /LexIA/,
  "Expected visible copy normalization to detect legacy LexIA branding."
);
assert.match(
  visibleCopySource,
  /replace\(LEGACY_AGENT_BRAND_PATTERN, "Clara"\)/,
  "Expected visible copy normalization to rewrite legacy agent branding to Clara."
);

const clientCockpitSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/pessoas/clientes/[clientId]/page.tsx"),
  "utf8"
);
assert.match(
  clientCockpitSource,
  /normalizeVisibleCopyList/,
  "Expected the client cockpit to normalize visible legacy copy from seeded data."
);

const demoSignInRouteSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/api/auth/demo-sign-in/route.ts"),
  "utf8"
);
assert.match(
  demoSignInRouteSource,
  /isSupabaseConfigured\(\)/,
  "Expected demo sign-in route to detect when Supabase is available."
);
assert.match(
  demoSignInRouteSource,
  /signInWithPassword/,
  "Expected demo sign-in route to create a real Supabase session when configuration is present."
);
assert.match(
  demoSignInRouteSource,
  /new URL\("\/crm", request\.url\)/,
  "Expected demo sign-in route to redirect to CRM instead of dashboard."
);
assert.match(
  sessionSource,
  /auth\.getUser\(\)/,
  "Expected workspace session resolution to authenticate the Supabase user via getUser()."
);
assert.match(
  sessionSource,
  /displayEmail/,
  "Expected workspace session resolution to carry a display email for UI-safe branding."
);

const signInRouteSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/api/auth/sign-in/route.ts"),
  "utf8"
);
assert.match(
  signInRouteSource,
  /new URL\("\/crm", request\.url\)/,
  "Expected the email/password sign-in route to redirect to CRM instead of dashboard."
);

const signInPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(auth)/sign-in/page.tsx"),
  "utf8"
);
assert.match(
  signInPageSource,
  /redirect\("\/crm"\)/,
  "Expected the sign-in page to send existing sessions to CRM."
);

const workspaceHeaderNarrativeSource = fs.readFileSync(
  path.join(__dirname, "..", "src/components/layout/workspace-header-narrative.tsx"),
  "utf8"
);
assert.match(
  workspaceHeaderNarrativeSource,
  /pathname\.startsWith\("\/crm"\)/,
  "Expected the workspace header narrative to follow CRM as the primary visible entry."
);

const claraSideCopilotSource = fs.readFileSync(
  path.join(__dirname, "..", "src/components/layout/clara-side-copilot.tsx"),
  "utf8"
);
assert.match(
  claraSideCopilotSource,
  /if \(pathname\.startsWith\("\/dashboard"\)\) return "crm";/,
  "Expected the Clara side copilot to treat dashboard as CRM compatibility, not as primary context."
);

const supabaseServerSource = fs.readFileSync(
  path.join(__dirname, "..", "src/lib/supabase/server.ts"),
  "utf8"
);
assert.match(
  supabaseServerSource,
  /Server Components cannot mutate cookies directly during render\./,
  "Expected Supabase server client to tolerate cookie writes during Server Component rendering."
);

const supabaseAdminSource = fs.readFileSync(
  path.join(__dirname, "..", "src/lib/supabase/admin.ts"),
  "utf8"
);
assert.match(
  supabaseAdminSource,
  /SUPABASE_SERVICE_ROLE_KEY/,
  "Expected Supabase admin client to require the service role key."
);

const dashboardServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/dashboard/get-dashboard-summary.ts"),
  "utf8"
);
assert.match(
  dashboardServiceSource,
  /getClients\(\)/,
  "Expected dashboard summary to read real clients."
);
assert.match(
  dashboardServiceSource,
  /getCases\(\)/,
  "Expected dashboard summary to read real cases."
);
assert.match(
  dashboardServiceSource,
  /getDocuments\(\)/,
  "Expected dashboard summary to read real documents."
);
assert.match(
  dashboardServiceSource,
  /getTasks\(\)/,
  "Expected dashboard summary to read real tasks."
);
assert.match(
  dashboardServiceSource,
  /getAgendaCommitments\(\)/,
  "Expected dashboard summary to read real agenda commitments."
);
assert.match(
  dashboardServiceSource,
  /getProceduralDeadlines\(\)/,
  "Expected dashboard summary to read real procedural deadlines."
);
assert.doesNotMatch(
  dashboardServiceSource,
  /mockClients|mockCases|mockDocuments|mockTasks/,
  "Expected dashboard summary to stop using primary mock sources."
);

const dashboardPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/dashboard/page.tsx"),
  "utf8"
);
assert.match(
  dashboardPageSource,
  /Painel executivo indisponivel no momento/,
  "Expected the dashboard route to render a neutral compatibility label."
);

assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/dashboard/loading.tsx")),
  true,
  "Expected loading state for the dashboard route."
);

const claraApiSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/clara/clara-api.ts"),
  "utf8"
);
assert.match(
  claraApiSource,
  /getClaraAnalysisApiPayload/,
  "Expected Clara API helper to expose analysis payload builders."
);
assert.match(
  claraApiSource,
  /getClaraCaseChecklistApiPayload/,
  "Expected Clara API helper to expose checklist payload builders."
);
assert.match(
  claraApiSource,
  /getClaraProcessSummaryApiPayload/,
  "Expected Clara API helper to expose process summary payload builders."
);
assert.match(
  claraApiSource,
  /getClaraPieceDraftApiPayload/,
  "Expected Clara API helper to expose piece draft payload builders."
);
assert.match(
  claraApiSource,
  /getClaraTechnicalOpinionApiPayload/,
  "Expected Clara API helper to expose technical opinion payload builders."
);
assert.match(
  claraApiSource,
  /taskType: "parecer-tecnico"/,
  "Expected Clara API helper to stamp the technical opinion task type."
);

const bcbSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/bcb/get-bcb-consultation.ts"),
  "utf8"
);
assert.match(
  bcbSource,
  /api\.bcb\.gov\.br\/dados\/serie\/bcdata\.sgs/,
  "Expected BCB SGS consultation to use the official public base URL."
);
assert.match(
  bcbSource,
  /olinda\.bcb\.gov\.br\/olinda\/servico\/PTAX\/versao\/v1\/odata/,
  "Expected BCB PTAX consultation to use the official public OData base URL."
);
assert.match(
  bcbSource,
  /dadosabertos\.bcb\.gov\.br\/dataset\/tarifas-bancarias-por-segmento-e-por-instituicao/,
  "Expected BCB tariffs consultation to point to the official open-data portal."
);

const claraInternalRouteSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/api/clara/analisar-caso/route.ts"),
  "utf8"
);
assert.match(
  claraInternalRouteSource,
  /taskType: "analisar-caso"/,
  "Expected Clara analysis route to default to the analyze-case task type."
);
assert.match(
  claraInternalRouteSource,
  /NextResponse\.json\(\{ ok: true, data \}\)/,
  "Expected Clara analysis route to respond with structured JSON."
);

const claraChecklistRouteSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/api/clara/checklist-documental/route.ts"),
  "utf8"
);
assert.match(
  claraChecklistRouteSource,
  /getClaraCaseChecklistApiPayload/,
  "Expected Clara checklist route to use the checklist payload builder."
);

const claraOpinionRouteSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/api/clara/parecer-tecnico/route.ts"),
  "utf8"
);
assert.match(
  claraOpinionRouteSource,
  /getClaraTechnicalOpinionApiPayload/,
  "Expected Clara technical opinion route to use the technical opinion payload builder."
);

const claraHistoryRouteSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/api/clara/historico/route.ts"),
  "utf8"
);
assert.match(
  claraHistoryRouteSource,
  /listClaraRecords/,
  "Expected Clara history route to expose stored Clara records."
);
assert.match(
  claraHistoryRouteSource,
  /listClaraExecutionLogs/,
  "Expected Clara history route to expose stored Clara execution logs."
);

const claraMinutasRouteSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/api/clara/minutas/route.ts"),
  "utf8"
);
assert.match(
  claraMinutasRouteSource,
  /listClaraRecords/,
  "Expected Clara minutas route to expose stored text-draft records."
);

const claraMinutaRecordRouteSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/api/clara/minutas/[recordId]/route.ts"),
  "utf8"
);
assert.match(
  claraMinutaRecordRouteSource,
  /updateClaraRecordWorkflowStatus/,
  "Expected Clara minuta record route to support workflow transitions."
);
assert.match(
  claraMinutaRecordRouteSource,
  /updateClaraRecordReviewNote/,
  "Expected Clara minuta record route to support human review notes."
);
assert.match(
  claraMinutaRecordRouteSource,
  /updateClaraRecordContent/,
  "Expected Clara minuta record route to support edited content."
);

const claraMinutaExportRouteSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/api/clara/minutas/[recordId]/exportacao/route.ts"),
  "utf8"
);
assert.match(
  claraMinutaExportRouteSource,
  /printable: true/,
  "Expected Clara minuta export route to mark the export as printable."
);
assert.match(
  claraMinutaExportRouteSource,
  /available: true/,
  "Expected Clara minuta export route to expose available export formats."
);

const claraMinutaActionsSource = fs.readFileSync(
  path.join(__dirname, "..", "src/components/layout/clara-minuta-actions.tsx"),
  "utf8"
);
assert.match(
  claraMinutaActionsSource,
  /window\.print\(\)/,
  "Expected Clara minuta actions to expose a print action."
);
assert.match(
  claraMinutaActionsSource,
  /Abrir DOCX/,
  "Expected Clara minuta actions to expose DOCX distribution."
);
assert.match(
  claraMinutaActionsSource,
  /Abrir PDF/,
  "Expected Clara minuta actions to expose PDF distribution."
);

const crmPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/crm/page.tsx"),
  "utf8"
);
assert.match(
  crmPageSource,
  /getCrmLeads\(\)/,
  "Expected CRM page to read real lead records."
);
assert.match(
  crmPageSource,
  /Leads e conversao do escritorio/,
  "Expected CRM page to present the CRM real leads heading."
);
assert.match(
  crmPageSource,
  /Abrir pipeline e follow-ups/,
  "Expected CRM page to link to the pipeline follow-up view."
);

const crmLeadsServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/crm/get-crm-leads.ts"),
  "utf8"
);
assert.match(
  crmLeadsServiceSource,
  /getClients\(\)/,
  "Expected CRM leads service to derive leads from real clients."
);
assert.match(
  crmLeadsServiceSource,
  /getCases\(\)/,
  "Expected CRM leads service to derive pipeline data from real cases."
);

const crmPipelinePageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/crm/pipeline/page.tsx"),
  "utf8"
);
assert.match(
  crmPipelinePageSource,
  /getCrmPipeline\(\)/,
  "Expected CRM pipeline page to read real pipeline data."
);
assert.match(
  crmPipelinePageSource,
  /Follow-ups ativos/,
  "Expected CRM pipeline page to render follow-up records."
);

const crmPipelineServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/crm/get-crm-pipeline.ts"),
  "utf8"
);
assert.match(
  crmPipelineServiceSource,
  /getClients\(\)/,
  "Expected CRM pipeline service to derive data from real clients."
);
assert.match(
  crmPipelineServiceSource,
  /getCases\(\)/,
  "Expected CRM pipeline service to derive data from real cases."
);
assert.match(
  crmPipelineServiceSource,
  /followUps/,
  "Expected CRM pipeline service to expose follow-up records."
);

const crmChatbotIntakeSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/crm/chatbot-intake.ts"),
  "utf8"
);
assert.match(
  crmChatbotIntakeSource,
  /crmChatbotIntakeSchema/,
  "Expected chatbot intake contract to validate the CRM payload."
);
assert.match(
  crmChatbotIntakeSource,
  /normalizeCrmChatbotIntake/,
  "Expected chatbot intake contract to normalize the lead payload."
);

const datajudServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/datajud/get-datajud-process.ts"),
  "utf8"
);
assert.match(
  datajudServiceSource,
  /DATAJUD_API_KEY/,
  "Expected DataJud service to read an API key from the environment when configured."
);
assert.match(
  datajudServiceSource,
  /api-publica\.datajud\.cnj\.jus\.br/,
  "Expected DataJud service to target the official CNJ public API base URL."
);
assert.match(
  datajudServiceSource,
  /numeroProcesso/,
  "Expected DataJud service to query by the normalized process number."
);

const datajudRouteSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/api/processos/[numero]/datajud/route.ts"),
  "utf8"
);
assert.match(
  datajudRouteSource,
  /getDataJudProcessConsultation/,
  "Expected the DataJud route to use the server-side consultation service."
);

const jurisprudenceStjRouteSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/api/jurisprudencia/stj/route.ts"),
  "utf8"
);
assert.match(
  jurisprudenceStjRouteSource,
  /getJurisprudenceConsultation\("stj"/,
  "Expected the STJ route to use the jurisprudence consultation service."
);

const jurisprudenceStfRouteSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/api/jurisprudencia/stf/route.ts"),
  "utf8"
);
assert.match(
  jurisprudenceStfRouteSource,
  /getJurisprudenceConsultation\("stf"/,
  "Expected the STF route to use the jurisprudence consultation service."
);

const consumidorReclamacoesRouteSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/api/consumidor/reclamacoes/route.ts"),
  "utf8"
);
assert.match(
  consumidorReclamacoesRouteSource,
  /getConsumidorReclamacoesConsultation/,
  "Expected the Consumidor.gov route to use the reclamacoes consultation service."
);

const jurisprudenceServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/jurisprudence/get-jurisprudence-consultation.ts"),
  "utf8"
);
assert.match(
  jurisprudenceServiceSource,
  /prepared_stub/,
  "Expected jurisprudence consultation to expose a controlled stub contract."
);

const consumidorServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/consumidor/get-consumidor-reclamacoes.ts"),
  "utf8"
);
assert.match(
  consumidorServiceSource,
  /prepared_stub/,
  "Expected Consumidor.gov consultation to expose a controlled stub contract."
);

const processDetailSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/processos/[processId]/page.tsx"),
  "utf8"
);
assert.match(
  processDetailSource,
  /Consultar DataJud/,
  "Expected the process cockpit to expose the DataJud consultation link."
);

const clientServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/clients/get-clients.ts"),
  "utf8"
);
assert.match(
  clientServiceSource,
  /getSupabaseAdminClient\(\)/,
  "Expected client reads to use the privileged Supabase admin client after workspace session resolution."
);
assert.match(
  clientServiceSource,
  /\.from\("clients"\)/,
  "Expected clients service to read from the real clients table."
);
assert.doesNotMatch(
  clientServiceSource,
  /mockClients/,
  "Expected clients service to stop using mock clients as its primary source."
);

const clientsPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/pessoas/clientes/page.tsx"),
  "utf8"
);
assert.match(
  clientsPageSource,
  /Clientes indisponiveis no momento/,
  "Expected clients page to render a controlled error state."
);

assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/pessoas/clientes/loading.tsx")),
  true,
  "Expected loading state for the clients list route."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/pessoas/clientes/[clientId]/loading.tsx")),
  true,
  "Expected loading state for the client detail route."
);

const adversaryServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/adversaries/get-adversaries.ts"),
  "utf8"
);
assert.match(
  adversaryServiceSource,
  /\.from\("adversaries"\)/,
  "Expected adversary service to read from the real adversaries table."
);
assert.doesNotMatch(
  adversaryServiceSource,
  /mock/,
  "Expected adversary service to avoid mock adversary sources."
);

const adversariesPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/pessoas/adversos/page.tsx"),
  "utf8"
);
assert.match(
  adversariesPageSource,
  /getAdversaries\(\)/,
  "Expected adversaries page to read real adversaries."
);
assert.match(
  adversariesPageSource,
  /Adversos indisponiveis no momento/,
  "Expected adversaries page to render a controlled error state."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/pessoas/adversos/loading.tsx")),
  true,
  "Expected loading state for the adversaries route."
);

const peopleSubpageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/pessoas/[subpage]/page.tsx"),
  "utf8"
);
assert.match(
  peopleSubpageSource,
  /getAdversaries\(\)/,
  "Expected people subpage to read real adversaries for opposing attorneys."
);
assert.match(
  peopleSubpageSource,
  /getClients\(\)/,
  "Expected people subpage to read real clients for contacts and parties."
);
assert.match(
  peopleSubpageSource,
  /Diretorio indisponivel no momento/,
  "Expected people subpage to render a controlled error state."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/pessoas/[subpage]/loading.tsx")),
  true,
  "Expected loading state for people directory subpages."
);

const processServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/processes/get-processes.ts"),
  "utf8"
);
assert.match(
  processServiceSource,
  /\.from\("processes"\)/,
  "Expected processes service to read from the real processes table."
);
assert.doesNotMatch(
  processServiceSource,
  /mockProcesses/,
  "Expected processes service to stop using mock processes as its primary source."
);

const processPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/processos/page.tsx"),
  "utf8"
);
assert.match(
  processPageSource,
  /Processos indisponiveis no momento/,
  "Expected processes page to render a controlled error state."
);

const processListPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/processos/lista/page.tsx"),
  "utf8"
);
assert.match(
  processListPageSource,
  /redirect\("\/processos"\)/,
  "Expected process list shortcut route to redirect to the canonical real process list."
);

const processTrashPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/processos/lixeira/page.tsx"),
  "utf8"
);
assert.match(
  processTrashPageSource,
  /getProcesses\(\)/,
  "Expected process trash page to read real processes."
);
assert.match(
  processTrashPageSource,
  /status === "closed"/,
  "Expected process trash page to filter archived or closed processes."
);
assert.doesNotMatch(
  processTrashPageSource,
  /Area preparada/,
  "Expected process trash page to stop rendering static placeholder rows."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/processos/lixeira/loading.tsx")),
  true,
  "Expected loading state for the process trash route."
);

[
  "importar-lote",
  "importar-oab"
].forEach((route) => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", `src/app/(workspace)/processos/${route}/page.tsx`),
    "utf8"
  );

  assert.match(
    source,
    /WorkspaceStatePanel/,
    `Expected processos/${route} to render a controlled unavailable state.`
  );
  assert.doesNotMatch(
    source,
    /Area preparada/,
    `Expected processos/${route} to stop rendering a placeholder prepared area.`
  );
});

assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/processos/loading.tsx")),
  true,
  "Expected loading state for the processes list route."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/processos/[processId]/loading.tsx")),
  true,
  "Expected loading state for the process detail route."
);

const proceduralUpdatesServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/procedural-updates/get-procedural-updates.ts"),
  "utf8"
);
assert.match(
  proceduralUpdatesServiceSource,
  /\.from\("procedural_updates"\)/,
  "Expected procedural updates service to read from the real procedural updates table."
);
assert.match(
  proceduralUpdatesServiceSource,
  /getClients\(\)/,
  "Expected procedural updates service to preserve real client context."
);
assert.match(
  proceduralUpdatesServiceSource,
  /getCases\(\)/,
  "Expected procedural updates service to preserve real case context."
);
assert.match(
  proceduralUpdatesServiceSource,
  /getProcesses\(\)/,
  "Expected procedural updates service to preserve real process context."
);
assert.doesNotMatch(
  proceduralUpdatesServiceSource,
  /mockProceduralUpdates|mockClients|mockCases|mockProcesses/,
  "Expected procedural updates service to stop using primary mock sources."
);

const officialDiaryServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/official-diary/get-official-diary.ts"),
  "utf8"
);
assert.match(
  officialDiaryServiceSource,
  /\.from\("official_diary_publications"\)/,
  "Expected official diary service to read from the real official diary publications table."
);
assert.match(
  officialDiaryServiceSource,
  /getClients\(\)/,
  "Expected official diary service to preserve real client context."
);
assert.match(
  officialDiaryServiceSource,
  /getCases\(\)/,
  "Expected official diary service to preserve real case context."
);
assert.match(
  officialDiaryServiceSource,
  /getProcesses\(\)/,
  "Expected official diary service to preserve real process context."
);
assert.match(
  officialDiaryServiceSource,
  /mapUrgencyToPriority/,
  "Expected official diary task draft priority mapping to remain available."
);
assert.match(
  officialDiaryServiceSource,
  /getArchivedOfficialDiaryPublications/,
  "Expected official diary service to expose archived publications."
);
assert.doesNotMatch(
  officialDiaryServiceSource,
  /mockOfficialDiaryPublications|mockClients|mockCases|mockProcesses/,
  "Expected official diary service to stop using primary mock sources."
);

const officialDiaryPublicationsPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/diario-oficial/publicacoes/page.tsx"),
  "utf8"
);
assert.match(
  officialDiaryPublicationsPageSource,
  /getOfficialDiaryPublications\(\)/,
  "Expected official diary publications page to read real publications."
);
assert.match(
  officialDiaryPublicationsPageSource,
  /Publicacoes indisponiveis no momento/,
  "Expected official diary publications page to render a controlled error state."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/diario-oficial/publicacoes/loading.tsx")),
  true,
  "Expected loading state for the official diary publications route."
);

const officialDiaryLawyersPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/diario-oficial/advogados/page.tsx"),
  "utf8"
);
assert.match(
  officialDiaryLawyersPageSource,
  /getProcesses\(\)/,
  "Expected official diary lawyers page to derive monitored lawyers from real processes."
);
assert.match(
  officialDiaryLawyersPageSource,
  /Advogados indisponiveis no momento/,
  "Expected official diary lawyers page to render a controlled error state."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/diario-oficial/advogados/loading.tsx")),
  true,
  "Expected loading state for the official diary lawyers route."
);

const officialDiaryKeywordsPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/diario-oficial/palavras-chave/page.tsx"),
  "utf8"
);
assert.match(
  officialDiaryKeywordsPageSource,
  /getAdversaries\(\)/,
  "Expected official diary keywords page to derive terms from real adversaries."
);
assert.match(
  officialDiaryKeywordsPageSource,
  /getOfficialDiaryPublications\(\)/,
  "Expected official diary keywords page to derive terms from real publications."
);
assert.match(
  officialDiaryKeywordsPageSource,
  /Palavras-chave indisponiveis no momento/,
  "Expected official diary keywords page to render a controlled error state."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/diario-oficial/palavras-chave/loading.tsx")),
  true,
  "Expected loading state for the official diary keywords route."
);

const officialDiaryTrashPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/diario-oficial/lixeira/page.tsx"),
  "utf8"
);
assert.match(
  officialDiaryTrashPageSource,
  /getArchivedOfficialDiaryPublications\(\)/,
  "Expected official diary trash page to read archived real publications."
);
assert.match(
  officialDiaryTrashPageSource,
  /Publicacoes excluidas indisponiveis/,
  "Expected official diary trash page to render a controlled error state."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/diario-oficial/lixeira/loading.tsx")),
  true,
  "Expected loading state for the official diary trash route."
);

const proceduralUpdatesPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/andamentos/automaticos/page.tsx"),
  "utf8"
);
assert.match(
  proceduralUpdatesPageSource,
  /getProceduralUpdates\(\)/,
  "Expected automatic procedural updates page to read real procedural updates."
);
assert.match(
  proceduralUpdatesPageSource,
  /Andamentos indisponiveis no momento/,
  "Expected automatic procedural updates page to render a controlled error state."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/andamentos/automaticos/loading.tsx")),
  true,
  "Expected loading state for the automatic procedural updates route."
);

const proceduralMonitoringPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/andamentos/monitoramentos/page.tsx"),
  "utf8"
);
assert.match(
  proceduralMonitoringPageSource,
  /getProcesses\(\)/,
  "Expected procedural monitoring page to read real processes."
);
assert.match(
  proceduralMonitoringPageSource,
  /Monitoramentos indisponiveis no momento/,
  "Expected procedural monitoring page to render a controlled error state."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/andamentos/monitoramentos/loading.tsx")),
  true,
  "Expected loading state for the procedural monitoring route."
);

const processLatestUpdatesPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/processos/ultimos-andamentos/page.tsx"),
  "utf8"
);
assert.match(
  processLatestUpdatesPageSource,
  /getProceduralUpdates\(\)/,
  "Expected process latest updates page to read real procedural updates."
);
assert.match(
  processLatestUpdatesPageSource,
  /Ultimos andamentos indisponiveis/,
  "Expected process latest updates page to render a controlled error state."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/processos/ultimos-andamentos/loading.tsx")),
  true,
  "Expected loading state for the process latest updates route."
);

const claraArtifactsSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/clara/get-clara-artifacts.ts"),
  "utf8"
);
assert.match(
  claraArtifactsSource,
  /bankLabel: bankingCase\.bankName/,
  "Expected Clara text draft artifact to expose the real banking case bank."
);
assert.match(
  claraArtifactsSource,
  /processLabel: bankingCase\.processNumber/,
  "Expected Clara text draft artifact to expose the real banking case process number."
);

const claraPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/clara/page.tsx"),
  "utf8"
);
assert.match(
  claraPageSource,
  /renderClaraContextualAnalysis\(contextualAnalysis\)/,
  "Expected Clara contextual analysis to render in both the controlled and full workspace states."
);
assert.match(
  claraPageSource,
  /id="clara-contextual-minima"/,
  "Expected Clara contextual analysis to expose a stable workspace anchor."
);

const textEditorSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/editor-de-texto/[subpage]/page.tsx"),
  "utf8"
);
assert.match(
  textEditorSource,
  /draftArtifact\.processLabel/,
  "Expected text editor draft to use the process label from Clara artifact."
);
assert.match(
  textEditorSource,
  /draftArtifact\.bankLabel/,
  "Expected text editor draft to use the bank label from Clara artifact."
);
assert.doesNotMatch(
  textEditorSource,
  /mockCases|@lexia\/mocks/,
  "Expected text editor draft to stop using mock cases."
);
assert.match(
  textEditorSource,
  /listClaraRecords\(80\)/,
  "Expected text editor to list persisted Clara text draft records."
);
assert.match(
  textEditorSource,
  /updateClaraWorkflowStatusAction/,
  "Expected text editor to expose workflow approval controls."
);
assert.match(
  textEditorSource,
  /updateClaraReviewNoteAction/,
  "Expected text editor to expose human review note controls."
);
assert.doesNotMatch(
  textEditorSource,
  /const modelRows = \[/,
  "Expected text editor models to stop using fixed model rows."
);
assert.doesNotMatch(
  textEditorSource,
  /Exibindo 0 resultado\(s\)/,
  "Expected text editor to stop showing a fixed zero-result count."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/editor-de-texto/[subpage]/loading.tsx")),
  true,
  "Expected loading state for editor text subpages."
);

const caseServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/cases/get-cases.ts"),
  "utf8"
);
assert.match(
  caseServiceSource,
  /\.from\("cases"\)/,
  "Expected cases service to read from the real cases table."
);
assert.doesNotMatch(
  caseServiceSource,
  /mockCases/,
  "Expected cases service to stop using mock cases as its primary source."
);

const claraWorkspaceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/clara/get-clara-workspace.ts"),
  "utf8"
);
assert.match(
  claraWorkspaceSource,
  /getCases\(\)/,
  "Expected Clara workspace to read real cases."
);
assert.match(
  claraWorkspaceSource,
  /getClients\(\)/,
  "Expected Clara workspace to read real clients."
);
assert.match(
  claraWorkspaceSource,
  /getProcesses\(\)/,
  "Expected Clara workspace to read real processes."
);
assert.match(
  claraWorkspaceSource,
  /getDocuments\(\)/,
  "Expected Clara workspace to read real documents."
);
assert.match(
  claraWorkspaceSource,
  /await getClaraStructuredCore\(/,
  "Expected Clara workspace to await the structured Clara core."
);
assert.match(
  claraWorkspaceSource,
  /getContractAnalyses\(\)/,
  "Expected Clara workspace to read real contract analyses."
);
assert.doesNotMatch(
  claraWorkspaceSource,
  /@lexia\/mocks|mockContractAnalyses/,
  "Expected Clara workspace to stop using the mocks package."
);
assert.match(
  claraWorkspaceSource,
  /claraResponseTemplates/,
  "Expected Clara workspace to keep static response templates locally."
);
assert.match(
  claraWorkspaceSource,
  /getClaraFixtureByContextKey/,
  "Expected Clara fixture helper to remain available for legacy LexIA compatibility."
);

const claraStructuredCoreSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/clara/get-clara-structured-core.ts"),
  "utf8"
);
assert.match(
  claraStructuredCoreSource,
  /getClients\(\)|getClientById\(/,
  "Expected Clara structured core to read real clients."
);
assert.match(
  claraStructuredCoreSource,
  /getCases\(\)|getCaseById\(/,
  "Expected Clara structured core to read real cases."
);
assert.match(
  claraStructuredCoreSource,
  /getProcesses\(\)|getProcessById\(/,
  "Expected Clara structured core to read real processes."
);
assert.match(
  claraStructuredCoreSource,
  /getDocuments\(\)|getDocumentById\(/,
  "Expected Clara structured core to read real documents."
);
assert.match(
  claraStructuredCoreSource,
  /getContractAnalysisByDocumentId\(/,
  "Expected Clara structured core to read real contract analyses."
);
assert.doesNotMatch(
  claraStructuredCoreSource,
  /mockClients|mockCases|mockDocuments|mockProcesses|mockContractAnalyses/,
  "Expected Clara structured core to stop using primary mock context sources."
);

const claraSourceAdaptersSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/clara/clara-source-adapters.ts"),
  "utf8"
);
assert.match(
  claraSourceAdaptersSource,
  /getClients\(\)|getClientById\(/,
  "Expected Clara source adapters to read real clients."
);
assert.match(
  claraSourceAdaptersSource,
  /getCases\(\)|getCaseById\(/,
  "Expected Clara source adapters to read real cases."
);
assert.match(
  claraSourceAdaptersSource,
  /getProcesses\(\)|getProcessById\(/,
  "Expected Clara source adapters to read real processes."
);
assert.match(
  claraSourceAdaptersSource,
  /getDocuments\(\)|getDocumentById\(/,
  "Expected Clara source adapters to read real documents."
);
assert.doesNotMatch(
  claraSourceAdaptersSource,
  /mockClients|mockCases|mockDocuments|mockProcesses/,
  "Expected Clara source adapters to stop using primary mock context sources."
);

const claraRevisionalWorkspaceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/clara/get-banking-revisional-workspace.ts"),
  "utf8"
);
assert.match(
  claraRevisionalWorkspaceSource,
  /getClients\(\)|getClientById\(/,
  "Expected Clara revisional workspace to read real clients."
);
assert.match(
  claraRevisionalWorkspaceSource,
  /getCases\(\)|getCaseById\(/,
  "Expected Clara revisional workspace to read real cases."
);
assert.match(
  claraRevisionalWorkspaceSource,
  /getProcesses\(\)|getProcessById\(/,
  "Expected Clara revisional workspace to read real processes."
);
assert.match(
  claraRevisionalWorkspaceSource,
  /getDocuments\(\)|getDocumentById\(/,
  "Expected Clara revisional workspace to read real documents."
);
assert.match(
  claraRevisionalWorkspaceSource,
  /getContractAnalysisByDocumentId\(/,
  "Expected Clara revisional workspace to read real contract analyses."
);
assert.doesNotMatch(
  claraRevisionalWorkspaceSource,
  /mockClients|mockCases|mockDocuments|mockProcesses|mockContractAnalyses/,
  "Expected Clara revisional workspace to stop using primary mock context sources."
);

const contractAnalysisSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/contract-analysis/get-contract-analysis.ts"),
  "utf8"
);
assert.match(
  contractAnalysisSource,
  /getClients\(\)|getClientById\(/,
  "Expected contract analysis workspace to read real clients."
);
assert.match(
  contractAnalysisSource,
  /getCases\(\)|getCaseById\(/,
  "Expected contract analysis workspace to read real cases."
);
assert.match(
  contractAnalysisSource,
  /getDocuments\(\)|getDocumentById\(/,
  "Expected contract analysis workspace to read real documents."
);
assert.match(
  contractAnalysisSource,
  /\.from\("contract_analyses"\)/,
  "Expected contract analysis workspace to read from the real contract analyses table."
);
assert.doesNotMatch(
  contractAnalysisSource,
  /Simulacao mockada/,
  "Expected contract analysis workspace to avoid mock simulation language."
);
assert.doesNotMatch(
  contractAnalysisSource,
  /mockClients|mockCases|mockDocuments|mockContractAnalyses/,
  "Expected contract analysis workspace to stop using primary mock context sources."
);

const documentServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/documents/get-documents.ts"),
  "utf8"
);
assert.match(
  documentServiceSource,
  /\.from\("documents"\)/,
  "Expected documents service to read from the real documents table."
);
assert.doesNotMatch(
  documentServiceSource,
  /mockDocuments/,
  "Expected documents service to stop using mock documents as its primary source."
);
assert.match(
  documentServiceSource,
  /storage_bucket/,
  "Expected documents service to expose storage bucket metadata."
);
assert.match(
  documentServiceSource,
  /storage_path/,
  "Expected documents service to expose storage path metadata."
);

const documentsPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/documentos/meus-arquivos/page.tsx"),
  "utf8"
);
assert.match(
  documentsPageSource,
  /Documentos indisponiveis no momento/,
  "Expected document GED page to render a controlled error state."
);
assert.match(
  documentsPageSource,
  /Base real: \{documents\.length\} docs/,
  "Expected document GED page to show an indicator derived from real documents."
);
assert.doesNotMatch(
  documentsPageSource,
  /Utilizado: 0\.0%/,
  "Expected document GED page to stop rendering a fixed storage percentage."
);

assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/documentos/meus-arquivos/loading.tsx")),
  true,
  "Expected loading state for the documents GED route."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/documentos/[documentId]/loading.tsx")),
  true,
  "Expected loading state for the document detail route."
);

const documentDetailSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/documentos/[documentId]/page.tsx"),
  "utf8"
);
assert.match(
  documentDetailSource,
  /getDocumentFileSignedUrl/,
  "Expected document detail to request a signed storage URL."
);
assert.match(
  documentDetailSource,
  /Baixar arquivo/,
  "Expected document detail to expose secure file download when storage is available."
);
assert.match(
  documentDetailSource,
  /Preview indisponivel/,
  "Expected document detail to clearly mark preview as unavailable."
);
assert.doesNotMatch(
  documentDetailSource,
  /Preview mockado/,
  "Expected document detail to stop rendering mock preview language."
);

const documentFileUrlSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/documents/get-document-file-url.ts"),
  "utf8"
);
assert.match(
  documentFileUrlSource,
  /createSignedUrl/,
  "Expected document file service to create signed storage URLs."
);
assert.match(
  documentFileUrlSource,
  /expiresInSeconds \?\? 300/,
  "Expected document file service to use short-lived signed URLs by default."
);

const documentUploadSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/documentos/enviar-arquivos/page.tsx"),
  "utf8"
);
assert.match(
  documentUploadSource,
  /uploadDocumentAction/,
  "Expected document upload UI to use the real server action."
);
assert.match(
  documentUploadSource,
  /getCases\(\)/,
  "Expected document upload UI to load real cases for required linking."
);
assert.match(
  documentUploadSource,
  /type="file"/,
  "Expected document upload UI to expose a real file input."
);
assert.doesNotMatch(
  documentUploadSource,
  /Envio de arquivos indisponivel|Escolher arquivos|Criar pasta de destino|Nenhum envio em andamento/,
  "Expected document upload to stop rendering unavailable or fake upload flow."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/documentos/enviar-arquivos/loading.tsx")),
  true,
  "Expected loading state for the document upload route."
);

const rootPackageSource = fs.readFileSync(
  path.join(__dirname, "..", "..", "..", "package.json"),
  "utf8"
);
assert.match(
  rootPackageSource,
  /"documents:upload": "node scripts\/documents\/upload-document\.cjs"/,
  "Expected document upload to start with a CLI command."
);
assert.match(
  rootPackageSource,
  /"supabase:bootstrap:sql": "node scripts\/supabase\/build-bootstrap-sql\.cjs"/,
  "Expected a CLI command to generate the consolidated Supabase bootstrap SQL."
);

const documentUploadCliSource = fs.readFileSync(
  path.join(__dirname, "..", "..", "..", "scripts/documents/upload-document.cjs"),
  "utf8"
);
assert.match(
  documentUploadCliSource,
  /\.storage\s*\.\s*listBuckets\(/,
  "Expected document upload CLI to inspect existing storage buckets."
);
assert.match(
  documentUploadCliSource,
  /\.storage\s*\.\s*createBucket\(BUCKET/,
  "Expected document upload CLI to bootstrap the document bucket when missing."
);
assert.match(
  documentUploadCliSource,
  /\.storage\s*\.\s*from\(BUCKET\)\s*\.\s*upload/,
  "Expected document upload CLI to upload files to Supabase Storage."
);
assert.match(
  documentUploadCliSource,
  /\.from\("documents"\)\.insert/,
  "Expected document upload CLI to register document metadata."
);
assert.match(
  documentUploadCliSource,
  /SUPABASE_SERVICE_ROLE_KEY/,
  "Expected document upload CLI to require a service role key for server-side ingestion."
);
assert.match(
  documentUploadCliSource,
  /loadLocalEnv\(\)/,
  "Expected document upload CLI to load local .env before execution."
);

const documentUploadActionSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/documentos/enviar-arquivos/actions.ts"),
  "utf8"
);
assert.match(
  documentUploadActionSource,
  /uploadTenantDocument\(/,
  "Expected document upload action to delegate storage upload to the shared document helper."
);
assert.match(
  documentUploadActionSource,
  /requireWorkspaceSession\(\)/,
  "Expected document upload action to require an authenticated workspace session."
);

const bankingIntakeActionSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/novo-atendimento-bancario/actions.ts"),
  "utf8"
);
assert.match(
  bankingIntakeActionSource,
  /getSupabaseAdminClient\(\)/,
  "Expected banking intake action to persist onboarding writes through the privileged Supabase admin client."
);
assert.match(
  bankingIntakeActionSource,
  /isSupabaseConfigured\(\)/,
  "Expected banking intake action to guard real onboarding writes behind explicit Supabase configuration."
);
assert.match(
  bankingIntakeActionSource,
  /demonstracao atual nao possui Supabase configurado/,
  "Expected banking intake action to fail with a controlled onboarding message when Supabase is unavailable."
);

const tenantDocumentUploadHelperSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/documents/upload-tenant-document.ts"),
  "utf8"
);
assert.match(
  tenantDocumentUploadHelperSource,
  /supabaseClient\?: SupabaseClient/,
  "Expected shared tenant document helper to accept an injected Supabase client for privileged write flows."
);
assert.match(
  tenantDocumentUploadHelperSource,
  /\.storage\s*\.\s*from\(TENANT_DOCUMENT_BUCKET\)\s*\.\s*upload/,
  "Expected shared tenant document helper to upload files to Supabase Storage."
);
assert.match(
  tenantDocumentUploadHelperSource,
  /\.from\("documents"\)\.insert/,
  "Expected shared tenant document helper to register document metadata."
);
assert.match(
  tenantDocumentUploadHelperSource,
  /\.storage\.from\(TENANT_DOCUMENT_BUCKET\)\.remove/,
  "Expected shared tenant document helper to clean up storage when metadata persistence fails."
);

const documentStorageMigrationSource = fs.readFileSync(
  path.join(__dirname, "..", "..", "..", "supabase/migrations/0013_document_storage_metadata.sql"),
  "utf8"
);
assert.match(
  documentStorageMigrationSource,
  /tenant-documents/,
  "Expected document storage migration to create the tenant document bucket."
);
assert.match(
  documentStorageMigrationSource,
  /storage_path/,
  "Expected document storage migration to add storage metadata columns."
);

const supabaseBootstrapSource = fs.readFileSync(
  path.join(__dirname, "..", "..", "..", "scripts/supabase/build-bootstrap-sql.cjs"),
  "utf8"
);
assert.match(
  supabaseBootstrapSource,
  /supabase\/migrations/,
  "Expected Supabase bootstrap builder to include migrations."
);
assert.match(
  supabaseBootstrapSource,
  /supabase\/policies/,
  "Expected Supabase bootstrap builder to include policies."
);
assert.match(
  supabaseBootstrapSource,
  /supabase\/seeds/,
  "Expected Supabase bootstrap builder to include seeds."
);
assert.match(
  supabaseBootstrapSource,
  /001_full_bootstrap\.sql/,
  "Expected Supabase bootstrap builder to write the consolidated SQL file."
);

const documentReportsSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/documentos/relatorios/page.tsx"),
  "utf8"
);
assert.match(
  documentReportsSource,
  /Relatorios de arquivos indisponiveis/,
  "Expected document reports to render a controlled unavailable state."
);
assert.doesNotMatch(
  documentReportsSource,
  /314572800 B|Uso atual: 0\.0%|Espaco utilizado/,
  "Expected document reports to stop rendering fixed storage metrics."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/documentos/relatorios/loading.tsx")),
  true,
  "Expected loading state for the document reports route."
);

const taskServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/tasks/get-tasks.ts"),
  "utf8"
);
assert.match(
  taskServiceSource,
  /getSupabaseAdminClient\(\)/,
  "Expected task reads to use the privileged Supabase admin client after workspace session resolution."
);
assert.match(
  taskServiceSource,
  /\.from\("tasks"\)/,
  "Expected tasks service to read from the real tasks table."
);
assert.doesNotMatch(
  taskServiceSource,
  /mockTasks/,
  "Expected tasks service to stop using mock tasks as its primary source."
);

const agendaTasksPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/agenda/tarefas/page.tsx"),
  "utf8"
);
assert.match(
  agendaTasksPageSource,
  /Tarefas indisponiveis no momento/,
  "Expected agenda tasks page to render a controlled error state."
);

assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/agenda/tarefas/loading.tsx")),
  true,
  "Expected loading state for the agenda tasks route."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/tarefas/[taskId]/loading.tsx")),
  true,
  "Expected loading state for the task detail route."
);

assert.match(
  claraWorkspaceSource,
  /getTasks\(\)/,
  "Expected Clara workspace to read real tasks."
);

const agendaServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/agenda/get-agenda-workspace.ts"),
  "utf8"
);
assert.match(
  agendaServiceSource,
  /getSupabaseAdminClient\(\)/,
  "Expected agenda reads to use the privileged Supabase admin client after workspace session resolution."
);
assert.match(
  agendaServiceSource,
  /\.from\("agenda_commitments"\)/,
  "Expected agenda service to read from the real agenda commitments table."
);
assert.match(
  agendaServiceSource,
  /\.from\("procedural_deadlines"\)/,
  "Expected agenda service to read from the real procedural deadlines table."
);
assert.doesNotMatch(
  agendaServiceSource,
  /mockAgendaCommitments|mockProceduralDeadlines/,
  "Expected agenda service to stop using mock commitments and deadlines as its primary source."
);

const agendaCommitmentsPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/agenda/compromissos/page.tsx"),
  "utf8"
);
assert.match(
  agendaCommitmentsPageSource,
  /Compromissos indisponiveis no momento/,
  "Expected agenda commitments page to render a controlled error state."
);

const agendaDeadlinesPageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/agenda/prazos/page.tsx"),
  "utf8"
);
assert.match(
  agendaDeadlinesPageSource,
  /Prazos indisponiveis no momento/,
  "Expected agenda deadlines page to render a controlled error state."
);

assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/agenda/compromissos/loading.tsx")),
  true,
  "Expected loading state for the agenda commitments route."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/agenda/prazos/loading.tsx")),
  true,
  "Expected loading state for the agenda deadlines route."
);

const agendaFallbackSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/agenda/[subpage]/page.tsx"),
  "utf8"
);
assert.match(
  agendaFallbackSource,
  /redirect\(route\)/,
  "Expected generic agenda subpage route to redirect to canonical real agenda routes."
);
assert.doesNotMatch(
  agendaFallbackSource,
  /rows:|Abrir agenda completa|Abrir tarefas/,
  "Expected generic agenda subpage route to stop rendering static shortcut rows."
);

const financeServiceSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/finance/get-financial-entries.ts"),
  "utf8"
);
assert.match(
  financeServiceSource,
  /\.from\("financial_entries"\)/,
  "Expected finance service to read from the real financial entries table."
);
assert.doesNotMatch(
  financeServiceSource,
  /mock/,
  "Expected finance service to avoid mock financial sources."
);

[
  ["receitas", "Receitas indisponiveis no momento"],
  ["despesas", "Despesas indisponiveis no momento"],
  ["transferencias", "Transferencias indisponiveis no momento"],
  ["vencimentos", "Vencimentos indisponiveis no momento"]
].forEach(([route, errorLabel]) => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", `src/app/(workspace)/financeiro/${route}/page.tsx`),
    "utf8"
  );

  assert.match(
    source,
    /getFinancialEntries\(/,
    `Expected financeiro/${route} page to read real financial entries.`
  );
  assert.match(
    source,
    new RegExp(errorLabel),
    `Expected financeiro/${route} page to render a controlled error state.`
  );
  assert.equal(
    fs.existsSync(path.join(__dirname, "..", `src/app/(workspace)/financeiro/${route}/loading.tsx`)),
    true,
    `Expected loading state for financeiro/${route}.`
  );
});

const financeFallbackSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/financeiro/[subpage]/page.tsx"),
  "utf8"
);
assert.match(
  financeFallbackSource,
  /redirect\(`\/financeiro\/\$\{params\.subpage\}`\)/,
  "Expected generic finance subpage route to redirect to canonical finance routes."
);
assert.doesNotMatch(
  financeFallbackSource,
  /Exibindo 0 resultado/,
  "Expected generic finance subpage route to stop rendering a static empty list."
);

const teamSubpageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/equipe/[subpage]/page.tsx"),
  "utf8"
);
assert.match(
  teamSubpageSource,
  /getProcesses\(\)/,
  "Expected team subpage to derive team members from real processes."
);
assert.match(
  teamSubpageSource,
  /getTasks\(\)/,
  "Expected team subpage to derive team members from real tasks."
);
assert.match(
  teamSubpageSource,
  /Equipe indisponivel no momento/,
  "Expected team subpage to render a controlled error state."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/equipe/[subpage]/loading.tsx")),
  true,
  "Expected loading state for team subpages."
);

const reportsSubpageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/relatorios/[subpage]/page.tsx"),
  "utf8"
);
assert.match(
  reportsSubpageSource,
  /getFinancialEntries\(\)/,
  "Expected reports page to build financial summaries from real financial entries."
);
assert.match(
  reportsSubpageSource,
  /getProcesses\(\)/,
  "Expected reports page to build process summaries from real processes."
);
assert.match(
  reportsSubpageSource,
  /getTasks\(\)/,
  "Expected reports page to build task summaries from real tasks."
);
assert.match(
  reportsSubpageSource,
  /Relatorio indisponivel no momento/,
  "Expected reports page to render a controlled error state."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/relatorios/[subpage]/loading.tsx")),
  true,
  "Expected loading state for report subpages."
);

const statsSubpageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/estatisticas/[subpage]/page.tsx"),
  "utf8"
);
assert.match(
  statsSubpageSource,
  /getProcesses\(\)/,
  "Expected statistics page to derive metrics from real processes."
);
assert.match(
  statsSubpageSource,
  /getClients\(\)/,
  "Expected statistics page to derive metrics from real clients."
);
assert.match(
  statsSubpageSource,
  /getFinancialEntries\(\)/,
  "Expected statistics page to derive financial metrics from real entries."
);
assert.match(
  statsSubpageSource,
  /Estatisticas indisponiveis no momento/,
  "Expected statistics page to render a controlled error state."
);
assert.doesNotMatch(
  statsSubpageSource,
  /Warning:|mysqli|implode|emptyDates/,
  "Expected statistics page to stop rendering legacy PHP warnings or fixed empty matrices."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/estatisticas/[subpage]/loading.tsx")),
  true,
  "Expected loading state for statistics subpages."
);

const siteSubpageSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/site/[subpage]/page.tsx"),
  "utf8"
);
assert.match(
  siteSubpageSource,
  /WorkspaceStatePanel/,
  "Expected site subpages to render a controlled unavailable state."
);
assert.match(
  siteSubpageSource,
  /Criador de site indisponivel/,
  "Expected site creator to be explicitly unavailable until backend exists."
);
assert.doesNotMatch(
  siteSubpageSource,
  /Criar meu site agora|Voce nao possui imagens cadastradas|Servico nao configurado|Salvar/,
  "Expected site subpages to stop rendering legacy functional placeholders."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/site/[subpage]/loading.tsx")),
  true,
  "Expected loading state for site subpages."
);

const settingsSource = fs.readFileSync(
  path.join(__dirname, "..", "src/app/(workspace)/configuracoes/page.tsx"),
  "utf8"
);
assert.match(
  settingsSource,
  /requireWorkspaceSession\(\)/,
  "Expected settings to read the real workspace session."
);
assert.match(
  settingsSource,
  /Preferencias editaveis indisponiveis/,
  "Expected settings to block editable preferences without persistence."
);
assert.doesNotMatch(
  settingsSource,
  /ADVX Demo|Navy \+ Amber|Modo Escuro|Blocos previstos/,
  "Expected settings to stop rendering demo tenant metrics and planned blocks."
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "src/app/(workspace)/configuracoes/loading.tsx")),
  true,
  "Expected loading state for settings."
);

const workspaceNavigationSource = fs.readFileSync(
  path.join(__dirname, "..", "src/components/layout/workspace-navigation.ts"),
  "utf8"
);
assert.match(
  workspaceNavigationSource,
  /label: "Clara"/,
  "Expected navigation config to expose Clara in the primary flow."
);
assert.match(
  workspaceNavigationSource,
  /label: "CRM"/,
  "Expected navigation config to expose CRM in the primary flow."
);
assert.match(
  workspaceNavigationSource,
  /label: "Clientes"/,
  "Expected navigation config to expose Clientes in the primary flow."
);
assert.match(
  workspaceNavigationSource,
  /label: "Diario oficial"/,
  "Expected navigation config to expose Diario oficial in the primary flow."
);
assert.match(
  workspaceNavigationSource,
  /label: "Andamentos"/,
  "Expected navigation config to expose Andamentos in the primary flow."
);
assert.match(
  workspaceNavigationSource,
  /label: "Agenda"/,
  "Expected navigation config to expose Agenda in the primary flow."
);
assert.match(
  workspaceNavigationSource,
  /label: "Configuracoes"/,
  "Expected navigation config to expose Configuracoes in the primary flow."
);
assert.doesNotMatch(
  workspaceNavigationSource,
  /label: "Hoje"|label: "Arquivos"|label: "Editor"|label: "Relatorios"|label: "Estatisticas"|label: "Equipe"/,
  "Expected absorbed or repositioned modules to stay out of the visible sidebar navigation."
);
assert.doesNotMatch(
  workspaceNavigationSource,
  /label: "Operacao"/,
  "Expected navigation config to stop exposing Operacao in the visible primary flow."
);
assert.doesNotMatch(
  workspaceNavigationSource,
  /label: "Lexia"|label: "Site"/,
  "Expected navigation config to hide Lexia and Site from visible navigation."
);

const workspaceShellSource = fs.readFileSync(
  path.join(__dirname, "..", "src/components/layout/workspace-shell.tsx"),
  "utf8"
);
assert.match(
  workspaceShellSource,
  /navSections\.filter\(\(section\) => section\.items\.length > 0\)\.map/,
  "Expected workspace shell to render grouped navigation sections."
);
assert.doesNotMatch(
  workspaceShellSource,
  /label: "Dashboard"|label: "Pessoas"|label: "Lexia"|label: "Site"/,
  "Expected workspace shell to stop hardcoding legacy labels in the visible navigation."
);

const claraRevisionalSource = fs.readFileSync(
  path.join(__dirname, "..", "src/server/services/clara/get-banking-revisional-workspace.ts"),
  "utf8"
);
assert.doesNotMatch(
  claraRevisionalSource,
  /Simulacao mockada/,
  "Expected Clara revisional workspace to avoid mock simulation language."
);

const documentsSeedSource = fs.readFileSync(
  path.join(__dirname, "..", "..", "..", "supabase/seeds/0005_documents_vertical_seed.sql"),
  "utf8"
);
assert.doesNotMatch(
  documentsSeedSource,
  /Preview mockado/,
  "Expected document seed labels to avoid mock preview language."
);

console.log("Workspace shell tests passed.");
