import { ReactNode } from "react";

import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { requireWorkspaceSession } from "@/lib/auth/session";

type WorkspaceLayoutProps = {
  children: ReactNode;
};

export default async function WorkspaceLayout({
  children
}: WorkspaceLayoutProps) {
  const session = await requireWorkspaceSession();

  return <WorkspaceShell session={session}>{children}</WorkspaceShell>;
}
