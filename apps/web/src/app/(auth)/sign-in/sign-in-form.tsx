"use client";

type SignInFormProps = {
  error?: string;
  supabaseConfigured: boolean;
};

export function SignInForm({ error, supabaseConfigured }: SignInFormProps) {
  return (
    <div className="sign-in-form space-y-5">
      <form action="/api/auth/sign-in" className="space-y-5" method="post">
        <div className="space-y-2">
          <label className="sign-in-label text-sm font-semibold text-slate-200" htmlFor="email">
            E-mail
          </label>
          <input
            className="sign-in-input w-full rounded-[18px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-cyan-300/35"
            id="email"
            name="email"
            placeholder="voce@escritorio.com.br"
            type="email"
          />
        </div>

        <div className="space-y-2">
          <label className="sign-in-label text-sm font-semibold text-slate-200" htmlFor="password">
            Senha
          </label>
          <input
            className="sign-in-input w-full rounded-[18px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-cyan-300/35"
            id="password"
            name="password"
            placeholder="********"
            type="password"
          />
        </div>

        {error ? (
          <div className="rounded-[20px] border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <button
          className="sign-in-primary-button rounded-[18px] bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-soft transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!supabaseConfigured}
          type="submit"
        >
          Entrar e abrir a Clara
        </button>
      </form>

      <form action="/api/auth/demo-sign-in" method="post">
        <button
          className="sign-in-demo-button w-full rounded-[18px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/25 hover:bg-white/[0.08]"
          type="submit"
        >
          Ver demonstracao guiada
        </button>
      </form>

      <p className="sign-in-helper text-sm font-medium leading-6 text-slate-400">
        A demonstracao abre a Clara dentro de um caso pronto, em vez de cair em um menu generico do sistema.
      </p>
    </div>
  );
}
