import {
  BankingCaseRecord,
  ClientRecord,
  JudicialProcessRecord
} from "@lexia/domain";
import { mockCases, mockClients, mockProcesses } from "@lexia/mocks";

export type JudicialProcessWithRelations = JudicialProcessRecord & {
  client: ClientRecord;
  bankingCase: BankingCaseRecord;
};

export async function getProcesses(): Promise<JudicialProcessWithRelations[]> {
  const resolvedProcesses: JudicialProcessWithRelations[] = [];

  for (const processItem of mockProcesses) {
    const client = mockClients.find((entry) => entry.id === processItem.clientId);
    const bankingCase = mockCases.find((entry) => entry.id === processItem.caseId);

    if (!client || !bankingCase) {
      continue;
    }

    resolvedProcesses.push({
      ...processItem,
      client,
      bankingCase
    });
  }

  return resolvedProcesses;
}

export async function getProcessById(
  processId: string
): Promise<JudicialProcessWithRelations | null> {
  const processes = await getProcesses();
  return processes.find((processItem) => processItem.id === processId) ?? null;
}

export async function getProcessByCaseId(
  caseId: string
): Promise<JudicialProcessWithRelations | null> {
  const processes = await getProcesses();
  return processes.find((processItem) => processItem.caseId === caseId) ?? null;
}
