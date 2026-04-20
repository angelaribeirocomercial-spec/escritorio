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

function buildFallbackContext(userId: string, email: string | null): WorkspaceContext {
  const tenantSlug = "lexia-demo";
  const tenantName = email?.split("@")[1]?.split(".")[0]
    ? `Escritorio ${email.split("@")[1].split(".")[0]}`
    : "LexIA Demo";

  const role: UserRole =
    email?.includes("owner") || email?.includes("socio")
      ? "owner"
      : email?.includes("admin")
        ? "admin"
        : email?.includes("assist")
          ? "assistant"
          : "lawyer";

  return {
    tenant: {
      id: "tenant-demo",
      name: tenantName,
      slug: tenantSlug,
      plan: "pro"
    },
    membership: {
      id: "membership-demo",
      userId,
      tenantId: "tenant-demo",
      role,
      isActive: true
    }
  };
}

export async function resolveWorkspaceContext(
  userId: string,
  email: string | null
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

  if (error || !data?.tenant) {
    return buildFallbackContext(userId, email);
  }

  const tenantRecord = Array.isArray(data.tenant) ? data.tenant[0] : data.tenant;

  if (!tenantRecord) {
    return buildFallbackContext(userId, email);
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
