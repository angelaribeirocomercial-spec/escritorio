import {
  BankingCaseRecord,
  ClientRecord,
  JudicialProcessRecord,
  OfficialDiaryPublicationRecord,
  TaskPriority
} from "@lexia/domain";
import {
  mockCases,
  mockClients,
  mockOfficialDiaryPublications,
  mockProcesses
} from "@lexia/mocks";

export type OfficialDiaryPublicationWithRelations = OfficialDiaryPublicationRecord & {
  client: ClientRecord;
  bankingCase: BankingCaseRecord;
  judicialProcess: JudicialProcessRecord;
};

export type OfficialDiaryTaskDraft = {
  publicationId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  clientName: string;
  caseTitle: string;
  processNumber: string;
  sourceLabel: string;
  publishedAt: string;
};

function mapUrgencyToPriority(urgency: OfficialDiaryPublicationRecord["urgency"]): TaskPriority {
  switch (urgency) {
    case "high":
      return "urgent";
    case "medium":
      return "high";
    default:
      return "medium";
  }
}

export async function getOfficialDiaryPublications(): Promise<
  OfficialDiaryPublicationWithRelations[]
> {
  const resolvedPublications: OfficialDiaryPublicationWithRelations[] = [];

  for (const publication of mockOfficialDiaryPublications) {
    const client = mockClients.find((entry) => entry.id === publication.clientId);
    const bankingCase = mockCases.find((entry) => entry.id === publication.caseId);
    const judicialProcess = mockProcesses.find(
      (entry) => entry.id === publication.processId
    );

    if (!client || !bankingCase || !judicialProcess) {
      continue;
    }

    resolvedPublications.push({
      ...publication,
      client,
      bankingCase,
      judicialProcess
    });
  }

  return resolvedPublications;
}

export async function getOfficialDiaryPublicationById(
  publicationId: string
): Promise<OfficialDiaryPublicationWithRelations | null> {
  const publications = await getOfficialDiaryPublications();
  return publications.find((entry) => entry.id === publicationId) ?? null;
}

export async function getOfficialDiaryTaskDraft(
  publicationId: string
): Promise<OfficialDiaryTaskDraft | null> {
  const publication = await getOfficialDiaryPublicationById(publicationId);

  if (!publication) {
    return null;
  }

  return {
    publicationId: publication.id,
    title: publication.suggestedTaskTitle,
    description: publication.suggestedTaskDescription,
    priority: mapUrgencyToPriority(publication.urgency),
    clientName: publication.client.fullName,
    caseTitle: publication.bankingCase.title,
    processNumber: publication.judicialProcess.processNumber,
    sourceLabel: publication.sourceLabel,
    publishedAt: publication.publishedAt
  };
}
