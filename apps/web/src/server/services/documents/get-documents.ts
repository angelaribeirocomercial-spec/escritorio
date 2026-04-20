import {
  BankingCaseRecord,
  ClientRecord,
  DocumentRecord
} from "@lexia/domain";
import { mockCases, mockClients, mockDocuments } from "@lexia/mocks";

type DocumentWithContext = DocumentRecord & {
  client: ClientRecord;
  bankingCase: BankingCaseRecord;
};

export async function getDocuments(): Promise<DocumentWithContext[]> {
  const resolvedDocuments: DocumentWithContext[] = [];

  for (const document of mockDocuments) {
    const client = mockClients.find((entry) => entry.id === document.clientId);
    const bankingCase = mockCases.find((entry) => entry.id === document.caseId);

    if (!client || !bankingCase) {
      continue;
    }

    resolvedDocuments.push({
      ...document,
      client,
      bankingCase
    });
  }

  return resolvedDocuments;
}

export async function getDocumentById(
  documentId: string
): Promise<DocumentWithContext | null> {
  const documents = await getDocuments();
  return documents.find((document) => document.id === documentId) ?? null;
}
