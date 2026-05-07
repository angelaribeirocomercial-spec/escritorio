import { createBankingIntakeAction } from "@/app/(workspace)/novo-atendimento-bancario/actions";
import { WorkspacePage } from "@/components/layout/workspace-page";

const intakeFormAction = createBankingIntakeAction as unknown as string;

export default function NovoAtendimentoBancarioPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  return <NovoAtendimentoBancarioPageContent searchParams={searchParams} />;
}

function NovoAtendimentoBancarioPageContent({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <WorkspacePage
      description="A abertura minima do atendimento captura identificacao e documento pessoal agora; banco, nicho e o restante dos anexos podem entrar depois no cockpit."
      eyebrow="Novo atendimento bancario"
      metrics={[
        { label: "Papel", value: "Entrada unica" },
        { label: "Fase", value: "Triagem inicial" },
        { label: "Minimo", value: "Contato + documento" },
        { label: "Destino", value: "Cockpit do cliente" }
      ]}
      title="Iniciar caso bancario"
    >
      <div className="workspace-soft-card rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Novo atendimento bancario
        </p>
        <p className="mt-1 text-[11px] leading-5 text-slate-400">
          O atendimento agora nasce pela triagem minima. Banco, nicho e anexos complementares podem ser fechados depois no cockpit do cliente.
        </p>
      </div>

      {errorMessage ? (
        <div className="workspace-panel border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Nao foi possivel concluir o atendimento.</p>
          <p className="mt-2 leading-6">{errorMessage}</p>
        </div>
      ) : null}

      <section className="grid gap-4">
        <form action={intakeFormAction} className="workspace-panel p-6" encType="multipart/form-data">
          <p className="text-sm font-semibold text-white">Triagem minima do atendimento</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            So `nome`, `endereco`, `telefone` e `documento pessoal` bloqueiam esta abertura. Banco, nicho juridico, objetivo e os demais anexos podem ser complementados depois.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Nome do cliente
              </label>
              <input
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                name="fullName"
                placeholder="Nome completo"
                required
                type="text"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Documento
              </label>
              <input
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                name="documentId"
                placeholder="CPF ou CNPJ se ja estiver disponivel"
                type="text"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                E-mail
              </label>
              <input
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                name="email"
                placeholder="cliente@exemplo.com"
                type="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Telefone
              </label>
              <input
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                name="phone"
                placeholder="(00) 00000-0000"
                required
                type="text"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                WhatsApp
              </label>
              <input
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                name="whatsapp"
                placeholder="Pode ser preenchido depois"
                type="text"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Origem do lead
              </label>
              <input
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                placeholder="Ex.: Clara, indicacao, campanha"
                name="leadSource"
                type="text"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Endereco
              </label>
              <input
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                name="address"
                placeholder="Endereco completo"
                required
                type="text"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Banco
              </label>
              <input
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                name="bankName"
                placeholder="Pode ser preenchido depois"
                type="text"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Nicho bancario
              </label>
              <select
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                defaultValue=""
                name="niche"
              >
                <option value="">Classificar depois na triagem</option>
                <optgroup label="Revisional">
                  <option value="revisional">Revisional de contratos (veiculos)</option>
                </optgroup>
                <optgroup label="Fraude bancaria">
                  <option value="fraude">Fraude bancaria (PIX)</option>
                  <option value="cartao-consignado">Cartao consignado / RMC</option>
                  <option value="beneficio-descontos">Descontos indevidos em beneficio previdenciario</option>
                </optgroup>
                <optgroup label="Busca e apreensao">
                  <option value="busca-apreensao">Busca e apreensao (veiculos)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Numero do contrato
              </label>
              <input
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                name="contractNumber"
                placeholder="Opcional nesta fase"
                type="text"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Objetivo inicial
              </label>
              <input
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                name="objective"
                placeholder="Ex.: reduzir parcela ou contestar fraude"
                type="text"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Observacoes internas
              </label>
              <textarea
                className="reference-search-input min-h-[8rem] w-full px-3 py-2 text-sm outline-none"
                name="notes"
                placeholder="Contexto adicional para a equipe e para a Clara."
              />
            </div>

            <div className="md:col-span-2">
              <div className="rounded-[4px] border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Documentos da triagem
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  O documento pessoal do cliente abre o atendimento. Os demais anexos podem entrar depois, sem travar o inicio do caso.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Documento pessoal do cliente
                    </label>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                      name="personalDocumentFile"
                      required
                      type="file"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Comprovante de residencia
                    </label>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                      name="addressProofFile"
                      type="file"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Contrato bancario ou CCB
                    </label>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                      name="contractFile"
                      type="file"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Comprovantes de pagamento
                    </label>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                      name="paymentsProofFile"
                      type="file"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Planilha ou historico das parcelas
                    </label>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.zip"
                      className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                      name="debtHistoryFile"
                      type="file"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Extrato do beneficio ou extrato bancario
                    </label>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                      name="benefitStatementFile"
                      type="file"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Comunicacoes com o banco
                    </label>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                      name="bankCommunicationFile"
                      type="file"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Documento do veiculo
                    </label>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                      name="vehicleDocumentFile"
                      type="file"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Notificacao de mora
                    </label>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                      name="defaultNoticeFile"
                      type="file"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            className="mt-6 rounded-[4px] bg-[linear-gradient(90deg,#22c55e,#4ade80)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-soft transition hover:brightness-105"
            type="submit"
          >
            Iniciar caso
          </button>
          <p className="mt-3 text-xs leading-5 text-slate-400">
            Esta fase abre o caso em `triagem inicial`, registra pendencias e encaminha o restante da completude para o cockpit do cliente.
          </p>
        </form>
      </section>
    </WorkspacePage>
  );
}
