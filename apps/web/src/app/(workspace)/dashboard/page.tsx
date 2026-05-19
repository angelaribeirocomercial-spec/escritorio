import { WorkspaceStatePanel } from "@lexia/ui";

import { DashboardCockpitFrame } from "@/components/layout/dashboard-cockpit-frame";
import { getDashboardSummary } from "@/server/services/dashboard/get-dashboard-summary";

export default async function DashboardPage() {
  let dashboard = null;

  try {
    dashboard = await getDashboardSummary();
  } catch {
    return (
      <div className="mj-model-page space-y-4">
        <WorkspaceStatePanel
          description="Nao foi possivel consolidar o painel operacional com a base real. Valide a configuracao do Supabase e as migracoes das verticais ativas do tenant."
          title="Painel executivo indisponivel no momento"
          tone="danger"
        />
      </div>
    );
  }

  return (
    <div className="mj-model-page space-y-4">
      <DashboardCockpitFrame dashboard={dashboard} />
    </div>
  );
}
