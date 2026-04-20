import { WorkspaceSession } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type SessionActionsProps = {
  session: WorkspaceSession;
};

export function SessionActions({ session }: SessionActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />

      <div className="reference-session-chip hidden text-right sm:block">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-300">
          {session.workspace.tenant.name}
        </p>
        <p className="mt-0.5 text-[11px] font-semibold text-white lg:text-xs">
          {session.email ?? "Usuario autenticado"}
        </p>
        <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-cyan-100">
          {session.role}
        </p>
      </div>

      <form action="/api/auth/sign-out" method="post">
        <button
          className="reference-header-button px-3 py-2 text-xs font-semibold transition"
          type="submit"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
