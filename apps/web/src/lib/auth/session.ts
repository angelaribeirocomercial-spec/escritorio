import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@lexia/domain";

import {
  buildDemoWorkspaceSession,
  DEMO_AUTH_COOKIE,
  isLocalDemoAccessEnabled
} from "@/lib/auth/demo-access";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  WorkspaceContext,
  resolveWorkspaceContext
} from "@/server/services/auth/workspace-context";

export type WorkspaceSession = {
  userId: string;
  email: string | null;
  role: UserRole;
  workspace: WorkspaceContext;
};

export async function getWorkspaceSession(): Promise<WorkspaceSession | null> {
  const cookieStore = cookies();

  if (
    isLocalDemoAccessEnabled() &&
    cookieStore.get(DEMO_AUTH_COOKIE)?.value === "enabled"
  ) {
    return buildDemoWorkspaceSession();
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const workspace = await resolveWorkspaceContext(
    session.user.id,
    session.user.email ?? null
  );

  return {
    userId: session.user.id,
    email: session.user.email ?? null,
    role: workspace.membership.role,
    workspace
  } satisfies WorkspaceSession;
}

export async function requireWorkspaceSession() {
  const session = await getWorkspaceSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}
