export default function AndamentosAutomaticosPage() {
  return (
    <div className="mj-model-page space-y-4">
      <div className="flex items-start justify-between">
        <p className="mj-model-title">Andamentos automaticos</p>
        <button className="mj-model-button-green" type="button">
          Adquirir andamentos
        </button>
      </div>

      <div className="mj-model-soft-panel px-4 py-4 text-[13px] leading-6 text-slate-400">
        <p>Atencao: Por nao haver uma integracao oficial com os sistemas dos tribunais, nao garantimos a entrega dos andamentos.</p>
        <p>A utilizacao dos andamentos automaticos nao desobriga o advogado a consultar o site dos tribunais.</p>
        <p>Nao nos responsabilizamos por eventuais perdas em decorrencia da utilizacao desta ferramenta.</p>
      </div>

      <section className="mj-model-panel px-5 py-5 text-[13px] leading-6 text-slate-300">
        <p className="text-[15px] font-semibold text-white">Sobre a ferramenta</p>
        <p className="mt-2">
          Diferente da ferramenta &quot;Diario Oficial&quot;, inclusa nos planos pagos como cortesia, que monitora nomes e OABs para recebimento de publicacoes, esta ferramenta captura as movimentacoes internas dos processos no padrao CNJ, nos sites dos tribunais, e salva diretamente em seus processos, como novos andamentos.
        </p>
        <p className="mt-2">
          Alertas de novos andamentos serao exibidos no icone localizado no menu superior e voce podera acompanha-los pelo menu &quot;Andamentos Automaticos&quot; e dentro de cada processo.
        </p>
        <p className="mt-2">
          Esta e uma ferramenta complementar ao sistema manual de cadastramento de andamentos do MaisJuridico para automatizar os processos.
        </p>

        <p className="mt-5 text-[15px] font-semibold text-white">IMPORTANTE - Leia antes de adquirir</p>
        <p className="mt-2">
          Esta ferramenta visa facilitar a busca e cadastramento de movimentacoes processuais mas o seu uso nao desobriga o advogado a consultar o site dos tribunais uma vez que nao podemos garantir a sua eficacia por nao existir ate o momento uma integracao oficial com os sistemas dos tribunais.
        </p>
        <p className="mt-2">
          Os sites dos tribunais mudam com frequencia e isto podera tornar nosso monitoramento de andamentos indisponivel por tempo indeterminado.
        </p>
        <p className="mt-2">
          A forma mais segura para evitar perda de informacoes e consultar seus processos nos sites dos tribunais, copiar os andamentos e inseri-los manualmente em seus processos, dispensando o uso desta ferramenta.
        </p>
        <p className="mt-2">
          Se voce ainda assim deseja utilizar esta ferramenta, e porque esta ciente da possibilidade de falha e nao captura dos andamentos.
        </p>

        <p className="mt-5 text-[15px] font-semibold text-white">Como monitorar um processo</p>
        <p className="mt-2">1 - Adquira um pacote para monitoramento de andamentos de acordo com a sua necessidade.</p>
        <p className="mt-1">2 - Edite seus processos e na opcao &quot;Configuracao do monitoramento&quot;, selecione a instancia que deseja monitorar.</p>
        <p className="mt-1">3 - Pronto. Seu processo entrou em fase de cadastramento e em breve suas movimentacoes serao monitoradas.</p>

        <p className="mt-5 text-[15px] font-semibold text-white">Adquirir pacote de andamentos</p>
        <p className="mt-2">Se voce esta ciente de que esta ferramenta pode falhar e nao capturar andamentos e mesmo assim deseja utiliza-la, clique aqui.</p>
      </section>
    </div>
  );
}
