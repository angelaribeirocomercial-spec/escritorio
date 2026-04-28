import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@lexia/domain";

import {
  buildDemoWorkspaceSession,
  DEMO_AUTH_COOKIE,
  isDemoAccessEnabled
} from "@/lib/auth/demo-access";
import { isSupabaseConfigured } from "@/lib/supabase/env";
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
    isDemoAccessEnabled() &&
    cookieStore.get(DEMO_AUTH_COOKIE)?.value === "enabled"
  ) {
    return buildDemoWorkspaceSession();
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const workspace = await resolveWorkspaceContext(session.user.id);

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
    if (!isSupabaseConfigured()) {
      redirect(
        "/sign-in?error=Configure%20NEXT_PUBLIC_SUPABASE_URL%20e%20NEXT_PUBLIC_SUPABASE_ANON_KEY%20ou%20use%20a%20demonstracao."
      );
    }

    redirect("/sign-in");
  }

  return session;
}
