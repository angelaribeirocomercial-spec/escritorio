import { UserRole } from "@lexia/domain";

import type { WorkspaceSession } from "@/lib/auth/session";

export const DEMO_AUTH_COOKIE = "lexia-demo-auth";
export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
export const DEMO_TENANT_ID = "11111111-1111-1111-1111-111111111111";
export const DEMO_MEMBERSHIP_ID = "22222222-2222-2222-2222-222222222222";
export const DEMO_EMAIL = "owner@lexia-demo.local";
export const DEMO_PASSWORD = "ChangeMe123!";
export const DEMO_VISIBLE_EMAIL = "workspace.demo@clara.local";
export const DEMO_VISIBLE_TENANT_NAME = "Clara Bancaria Demo";
export const DEMO_VISIBLE_TENANT_SLUG = "clara-bancaria-demo";

export function isDemoAccessEnabled() {
  return process.env.LEXIA_DISABLE_DEMO_ACCESS !== "true";
}

export function isDemoWorkspaceContext(params: {
  userId?: string | null;
  tenantId?: string | null;
  email?: string | null;
}) {
  return (
    params.userId === DEMO_USER_ID ||
    params.tenantId === DEMO_TENANT_ID ||
    params.email === DEMO_EMAIL
  );
}

export function buildDemoWorkspaceSession(): WorkspaceSession {
  const role: UserRole = "owner";

  return {
    userId: DEMO_USER_ID,
    email: DEMO_EMAIL,
    displayEmail: DEMO_VISIBLE_EMAIL,
    role,
    workspace: {
      tenant: {
        id: DEMO_TENANT_ID,
        name: DEMO_VISIBLE_TENANT_NAME,
        slug: DEMO_VISIBLE_TENANT_SLUG,
        plan: "pro"
      },
      membership: {
        id: DEMO_MEMBERSHIP_ID,
        userId: DEMO_USER_ID,
        tenantId: DEMO_TENANT_ID,
        role,
        isActive: true
      }
    }
  };
}
