import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceStatePanel } from "@lexia/ui";

import { getAdversaries } from "@/server/services/adversaries/get-adversaries";
import { getClients } from "@/server/services/clients/get-clients";

type SearchParams = {
  termo?: string;
};

export default async function PessoasSubpage({
  params,
  searchParams
}: {
  params: { subpage: string };
  searchParams?: SearchParams;
}) {
  if (!["advogados-adversos", "contatos-partes"].includes(params.subpage)) {
    notFound();
  }

  let rows: Array<{ id: string; name: string; detail: string }> = [];
  let state: {
    title: string;
    description: string;
    tone?: "neutral" | "warning" | "danger";
  } | null = null;

  try {
    if (params.subpage === "advogados-adversos") {
      const adversaries = await getAdversaries();
      rows = adversaries.map((adversary) => ({
        id: adversary.id,
        name: adversary.attorneyLabel || adversary.name,
        detail: `${adversary.name} | ${adversary.contactLabel || "Contato nao informado"}`
      }));
    } else {
      const clients = await getClients();
      rows = clients.map((client) => ({
        id: client.id,
        name: client.fullName,
        detail: `Cliente | WhatsApp ${client.whatsapp} | ${client.email}`
      }));
    }
  } catch {
    state = {
      title: "Diretorio indisponivel no momento",
      description:
        "Nao foi possivel carregar a base real de pessoas. Valide Supabase, migrations e seed do tenant ativo.",
      tone: "danger"
    };
  }

  const page =
    params.subpage === "advogados-adversos"
      ? {
          title: "Advogados adversos",
          emptyState: "Voce ainda nao cadastrou nenhum advogado adverso.",
          actionHref: "/pessoas/adversos/novo",
          actionLabel: "Novo adverso",
          actionTitle: "Abrir cadastro real de adverso."
        }
      : {
          title: "Contatos / Partes",
          emptyState: "Voce ainda nao cadastrou nenhuma parte.",
          actionHref: "/novo-atendimento-bancario",
          actionLabel: "Novo atendimento",
          actionTitle: "Abrir o fluxo real de entrada de um novo caso."
        };
  const term = searchParams?.termo?.toLowerCase().trim() ?? "";
  const filteredItems = rows.filter((item) =>
    !term ? true : `${item.name} ${item.detail}`.toLowerCase().includes(term)
  );

  return (
    <div className="mj-model-page space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <p className="mj-model-title">{page.title}</p>
        <div className="flex gap-2">
          <Link
            className="mj-model-button-green inline-flex items-center justify-center"
            href={page.actionHref}
            title={page.actionTitle}
          >
            {page.actionLabel}
          </Link>
        </div>
      </div>

      <p className="mj-model-subtitle">Exibindo {filteredItems.length} resultado(s)</p>

      <section className="mj-model-toolbar px-4 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-[6rem] text-[13px] font-semibold text-slate-400">Busca</div>
          <form className="flex w-full gap-3" method="get">
            <input
              className="mj-model-input w-full px-3 outline-none"
              defaultValue={searchParams?.termo ?? ""}
              name="termo"
              type="text"
            />
            <button className="mj-model-button-gray" type="submit">
              Buscar
            </button>
          </form>
        </div>
      </section>

      {state ? (
        <WorkspaceStatePanel
          description={state.description}
          title={state.title}
          tone={state.tone ?? "neutral"}
        />
      ) : filteredItems.length === 0 ? (
        <div className="mj-model-panel px-4 py-4">
          <p className="mj-model-empty">{page.emptyState}</p>
        </div>
      ) : (
        <div className="mj-model-panel overflow-hidden">
          <div className="divide-y divide-white/10">
            {filteredItems.map((item) => (
              <div key={item.id} className="px-5 py-4">
                <p className="text-[15px] font-semibold text-slate-100">{item.name}</p>
                <p className="mt-1 text-[13px] text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
