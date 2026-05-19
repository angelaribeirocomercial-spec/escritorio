import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@lexia/domain";

import {
  buildDemoWorkspaceSession,
  DEMO_AUTH_COOKIE,
  DEMO_VISIBLE_EMAIL,
  DEMO_VISIBLE_TENANT_NAME,
  DEMO_VISIBLE_TENANT_SLUG,
  isDemoAccessEnabled,
  isDemoWorkspaceContext
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
  displayEmail: string | null;
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
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const workspace = await resolveWorkspaceContext(user.id);
  const isDemoContext = isDemoWorkspaceContext({
    userId: user.id,
    tenantId: workspace.tenant.id,
    email: user.email ?? null
  });

  return {
    userId: user.id,
    email: user.email ?? null,
    displayEmail: isDemoContext ? DEMO_VISIBLE_EMAIL : user.email ?? null,
    role: workspace.membership.role,
    workspace: isDemoContext
      ? {
          ...workspace,
          tenant: {
            ...workspace.tenant,
            name: DEMO_VISIBLE_TENANT_NAME,
            slug: DEMO_VISIBLE_TENANT_SLUG
          }
        }
      : workspace
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
