import { TaskRecord } from "@lexia/domain";
import { mockCases, mockClients, mockTasks } from "@lexia/mocks";

type EnrichedTask = TaskRecord & {
  client: (typeof mockClients)[number];
  bankingCase: (typeof mockCases)[number];
  completedChecklistCount: number;
};

function enrichTask(task: TaskRecord): EnrichedTask {
  const client = mockClients.find((clientItem) => clientItem.id === task.clientId);
  const bankingCase = mockCases.find((caseItem) => caseItem.id === task.caseId);

  if (!client || !bankingCase) {
    throw new Error(`Task ${task.id} is missing linked client or case data.`);
  }

  return {
    ...task,
    client,
    bankingCase,
    completedChecklistCount: task.checklist.filter((item) => item.done).length
  };
}

export async function getTasks() {
  return mockTasks.map(enrichTask);
}

export async function getTaskById(taskId: string) {
  const task = mockTasks.find((taskItem) => taskItem.id === taskId);

  return task ? enrichTask(task) : null;
}
