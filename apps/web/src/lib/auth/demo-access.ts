import { UserRole } from "@lexia/domain";

import { WorkspaceSession } from "@/lib/auth/session";

export const DEMO_AUTH_COOKIE = "lexia-demo-auth";

export function isDemoAccessEnabled() {
  return process.env.LEXIA_DISABLE_DEMO_ACCESS !== "true";
}

export function buildDemoWorkspaceSession(): WorkspaceSession {
  const role: UserRole = "owner";

  return {
    userId: "demo-user",
    email: "socio@lexia-demo.com.br",
    role,
    workspace: {
      tenant: {
        id: "tenant-demo",
        name: "LexIA Bancaria Demo",
        slug: "lexia-demo",
        plan: "pro"
      },
      membership: {
        id: "membership-demo",
        userId: "demo-user",
        tenantId: "tenant-demo",
        role,
        isActive: true
      }
    }
  };
}
