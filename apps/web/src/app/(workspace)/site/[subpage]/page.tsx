import { notFound } from "next/navigation";

const shellStyle = {
  background: "var(--surface-1)",
  borderColor: "rgba(226, 232, 240, 0.92)",
  color: "hsl(var(--foreground))"
} as const;

const mutedStyle = { color: "rgba(100, 116, 139, 0.92)" } as const;

function SiteWizardCard() {
  return (
    <div className="reference-list-shell max-w-[20rem] px-5 py-5" style={shellStyle}>
      <div className="flex gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
          <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 32 32">
            <rect x="6" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M10 24h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="space-y-3 text-[10px]" style={mutedStyle}>
          <p className="font-semibold text-sky-700">
            Crie seu site em minutos com este sistema passo a passo do MaisJuridico!
          </p>
          <p>
            Basta seguir este wizard preenchendo os campos solicitados para criar uma pagina inicial completa.
          </p>
          <p>
            Apos a criacao da pagina inicial, sera possivel criar novas paginas e liberar acesso para seus clientes pelo seu proprio site!
          </p>
          <button className="reference-action-primary px-4 py-2 text-[10px] font-semibold" type="button">
            Criar meu site agora
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageBankPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <p className="text-[2rem] font-medium" style={{ color: "rgba(148, 163, 184, 0.92)" }}>
          Banco de imagens
        </p>
        <div className="flex gap-2">
          <button className="reference-action-secondary px-5 py-2 text-[10px] font-semibold" type="button">
            Pre-visualizar site
          </button>
          <button className="reference-action-primary px-5 py-2 text-[10px] font-semibold" type="button">
            Adicionar
          </button>
        </div>
      </div>

      <div className="reference-list-shell px-4 py-3 text-[10px]" style={{ ...shellStyle, ...mutedStyle }}>
        Voce nao possui imagens cadastradas
      </div>
    </div>
  );
}

function EmailPage() {
  return (
    <div className="space-y-4">
      <p className="text-[2rem] font-medium" style={{ color: "rgba(148, 163, 184, 0.92)" }}>
        Acesso aos e-mails
      </p>
      <div className="reference-list-shell px-4 py-4 text-[10px]" style={shellStyle}>
        <p className="font-semibold text-sky-700">Servico nao configurado</p>
        <p className="mt-2" style={mutedStyle}>
          Voce nao possui um servico de e-mails com o MaisJuridico.
        </p>
      </div>
    </div>
  );
}

function ConfigPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <p className="text-[2rem] font-medium" style={{ color: "rgba(148, 163, 184, 0.92)" }}>
          Configuracoes
        </p>
        <button className="reference-action-secondary px-5 py-2 text-[10px] font-semibold" type="button">
          Pre-visualizar site
        </button>
      </div>

      <section className="reference-list-shell px-4 py-4" style={shellStyle}>
        <p className="mb-3 text-xs font-semibold text-sky-700">Cores e logotipo</p>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold" style={mutedStyle}>Cor do menu</label>
            <input className="reference-search-input h-7 w-24 px-2 text-[10px] outline-none" defaultValue="" style={shellStyle} type="text" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold" style={mutedStyle}>Area do cliente</label>
            <input className="reference-search-input h-7 w-24 px-2 text-[10px] outline-none" defaultValue="" style={shellStyle} type="text" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold" style={mutedStyle}>Cor dos links do menu</label>
            <input className="reference-search-input h-7 w-24 px-2 text-[10px] outline-none" defaultValue="" style={shellStyle} type="text" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold" style={mutedStyle}>Logotipo do menu externo</label>
            <select className="reference-search-input w-full px-3 py-2 text-[10px] outline-none" style={shellStyle}>
              <option>Voce nao possui imagens cadastradas no banco de imagens do site</option>
            </select>
            <p className="mt-1 text-[10px] text-sky-700">Clique aqui para cadastrar imagens na ferramenta site</p>
          </div>
        </div>
      </section>

      <section className="reference-list-shell px-4 py-4" style={shellStyle}>
        <p className="mb-3 text-xs font-semibold text-sky-700">Botao de Whatsapp</p>
        <label className="flex items-center gap-2 text-[10px]" style={mutedStyle}>
          <input type="checkbox" />
          <span>Habilitar botao do WhatsApp no site</span>
        </label>
      </section>

      <section className="reference-list-shell px-4 py-4" style={shellStyle}>
        <p className="mb-3 text-xs font-semibold text-sky-700">E-mail do fale conosco</p>
        <div>
          <label className="mb-1 block text-[10px] font-semibold" style={mutedStyle}>Ao receber um contato</label>
          <select className="reference-search-input w-full px-3 py-2 text-[10px] outline-none" style={shellStyle}>
            <option>Criar um protocolo interno de atendimento (SAC)</option>
            <option>Realizar o atendimento por e-mail</option>
          </select>
        </div>
      </section>

      <section className="reference-list-shell px-4 py-4" style={shellStyle}>
        <p className="mb-3 text-xs font-semibold text-sky-700">Inserir scripts</p>
        {[
          "Scripts do cabecalho (tag header)",
          "Scripts do corpo (inicio da tag body)",
          "Inserir scripts no corpo (final da tag body)"
        ].map((label) => (
          <div key={label} className="mb-4 last:mb-0">
            <label className="mb-1 block text-[10px] font-semibold" style={mutedStyle}>{label}</label>
            <textarea
              className="reference-search-input min-h-[10rem] w-full px-3 py-3 text-[10px] outline-none"
              placeholder="Cole aqui os scripts ou terceiros, que voce deseja que sejam inseridos no site"
              style={shellStyle}
            />
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <button className="reference-action-primary px-8 py-2 text-[10px] font-semibold" type="button">
          Salvar
        </button>
      </div>
    </div>
  );
}

export default function SiteSubpage({
  params
}: {
  params: { subpage: string };
}) {
  if (params.subpage === "paginas-do-site") {
    return (
      <div className="space-y-4">
        <p className="text-[2rem] font-medium" style={{ color: "rgba(148, 163, 184, 0.92)" }}>
          Paginas do site
        </p>
        <SiteWizardCard />
      </div>
    );
  }

  if (params.subpage === "banco-de-imagens") {
    return <ImageBankPage />;
  }

  if (params.subpage === "email") {
    return <EmailPage />;
  }

  if (params.subpage === "configuracoes") {
    return <ConfigPage />;
  }

  notFound();
}
