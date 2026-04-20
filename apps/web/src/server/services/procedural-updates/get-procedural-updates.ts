import {
  BankingCaseRecord,
  ClientRecord,
  JudicialProcessRecord,
  ProceduralUpdateRecord
} from "@lexia/domain";
import {
  mockCases,
  mockClients,
  mockProceduralUpdates,
  mockProcesses
} from "@lexia/mocks";

export type ProceduralUpdateWithRelations = ProceduralUpdateRecord & {
  client: ClientRecord;
  bankingCase: BankingCaseRecord;
  judicialProcess: JudicialProcessRecord;
};

export async function getProceduralUpdates(): Promise<
  ProceduralUpdateWithRelations[]
> {
  const resolvedUpdates: ProceduralUpdateWithRelations[] = [];

  for (const update of mockProceduralUpdates) {
    const client = mockClients.find((entry) => entry.id === update.clientId);
    const bankingCase = mockCases.find((entry) => entry.id === update.caseId);
    const judicialProcess = mockProcesses.find((entry) => entry.id === update.processId);

    if (!client || !bankingCase || !judicialProcess) {
      continue;
    }

    resolvedUpdates.push({
      ...update,
      client,
      bankingCase,
      judicialProcess
    });
  }

  return resolvedUpdates;
}

export async function getProceduralUpdateById(
  updateId: string
): Promise<ProceduralUpdateWithRelations | null> {
  const updates = await getProceduralUpdates();
  return updates.find((entry) => entry.id === updateId) ?? null;
}

export async function getProceduralUpdatesByProcessId(
  processId: string
): Promise<ProceduralUpdateWithRelations[]> {
  const updates = await getProceduralUpdates();
  return updates.filter((entry) => entry.processId === processId);
}
