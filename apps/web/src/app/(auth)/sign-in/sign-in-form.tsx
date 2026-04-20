"use client";

type SignInFormProps = {
  error?: string;
};

export function SignInForm({ error }: SignInFormProps) {
  return (
    <div className="space-y-5">
      <form action="/api/auth/sign-in" className="space-y-5" method="post">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200" htmlFor="email">
            E-mail
          </label>
          <input
            className="w-full rounded-[18px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-cyan-300/35"
            id="email"
            name="email"
            placeholder="voce@escritorio.com.br"
            type="email"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200" htmlFor="password">
            Senha
          </label>
          <input
            className="w-full rounded-[18px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-cyan-300/35"
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
          className="rounded-[18px] bg-[linear-gradient(90deg,#f5b942,#ffd273)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-soft transition hover:opacity-95"
          type="submit"
        >
          Entrar no workspace
        </button>
      </form>

      <form action="/api/auth/demo-sign-in" method="post">
        <button
          className="w-full rounded-[18px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/25 hover:bg-white/[0.08]"
          type="submit"
        >
          Entrar na demonstracao local
        </button>
      </form>

      <p className="text-sm font-medium leading-6 text-slate-400">
        O acesso de demonstracao existe para validar UX, contraste e navegacao sem depender de credenciais reais.
      </p>
    </div>
  );
}
