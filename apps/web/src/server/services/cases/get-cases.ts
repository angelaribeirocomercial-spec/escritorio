import { BankingCaseRecord, ClientRecord } from "@lexia/domain";
import { mockCases, mockClients } from "@lexia/mocks";

type BankingCaseWithClient = BankingCaseRecord & {
  client: ClientRecord;
};

export async function getCases(): Promise<BankingCaseWithClient[]> {
  const resolvedCases: BankingCaseWithClient[] = [];

  for (const caseItem of mockCases) {
    const client = mockClients.find((entry) => entry.id === caseItem.clientId);

    if (!client) {
      continue;
    }

    resolvedCases.push({
      ...caseItem,
      client
    });
  }

  return resolvedCases;
}

export async function getCaseById(
  caseId: string
): Promise<BankingCaseWithClient | null> {
  const cases = await getCases();
  return cases.find((caseItem) => caseItem.id === caseId) ?? null;
}
