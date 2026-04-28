import {
  MembershipSummary,
  TenantSummary,
  UserRole
} from "@lexia/domain";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type WorkspaceContext = {
  tenant: TenantSummary;
  membership: MembershipSummary;
};

export class WorkspaceContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceContextError";
  }
}

export async function resolveWorkspaceContext(
  userId: string
): Promise<WorkspaceContext> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("memberships")
    .select(
      `
        id,
        user_id,
        tenant_id,
        role,
        is_active,
        tenant:tenants (
          id,
          name,
          slug,
          plan
        )
      `
    )
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new WorkspaceContextError(
      `Failed to resolve workspace membership for user ${userId}.`
    );
  }

  if (!data?.tenant) {
    throw new WorkspaceContextError(
      `No active workspace membership found for user ${userId}.`
    );
  }

  const tenantRecord = Array.isArray(data.tenant) ? data.tenant[0] : data.tenant;

  if (!tenantRecord) {
    throw new WorkspaceContextError(
      `Membership for user ${userId} does not include a tenant record.`
    );
  }

  return {
    tenant: {
      id: tenantRecord.id,
      name: tenantRecord.name,
      slug: tenantRecord.slug,
      plan: tenantRecord.plan ?? "trial"
    },
    membership: {
      id: data.id,
      userId: data.user_id,
      tenantId: data.tenant_id,
      role: (data.role as UserRole) ?? "lawyer",
      isActive: data.is_active ?? true
    }
  };
}
