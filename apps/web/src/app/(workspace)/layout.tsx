import { ReactNode } from "react";

import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { requireWorkspaceSession } from "@/lib/auth/session";
import { getWorkspaceShellSearchEntries } from "@/server/services/workspace/get-workspace-shell-search";

type WorkspaceLayoutProps = {
  children: ReactNode;
};

export default async function WorkspaceLayout({
  children
}: WorkspaceLayoutProps) {
  const session = await requireWorkspaceSession();
  const searchEntries = await getWorkspaceShellSearchEntries().catch(() => []);

  return <WorkspaceShell searchEntries={searchEntries} session={session}>{children}</WorkspaceShell>;
}
