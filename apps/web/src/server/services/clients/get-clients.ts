import { ClientRecord } from "@lexia/domain";
import { mockClients } from "@lexia/mocks";

export async function getClients(): Promise<ClientRecord[]> {
  return [...mockClients];
}

export async function getClientById(clientId: string): Promise<ClientRecord | null> {
  return mockClients.find((client) => client.id === clientId) ?? null;
}
