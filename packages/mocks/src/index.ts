export const scaffoldModules = [
  "dashboard",
  "clientes",
  "casos",
  "processos",
  "diario-oficial",
  "andamentos",
  "agenda",
  "documentos",
  "tarefas",
  "lexia"
] as const;

export { mockClients } from "./clients";
export { mockCases } from "./cases";
export { mockProcesses } from "./processes";
export { mockOfficialDiaryPublications } from "./official-diary";
export { mockProceduralUpdates } from "./procedural-updates";
export { mockAgendaCommitments, mockProceduralDeadlines } from "./agenda";
export { mockDocuments } from "./documents";
export { mockTasks } from "./tasks";
export { lexiaFixtures } from "./lexia";
export { mockContractAnalyses } from "./contract-analyses";
