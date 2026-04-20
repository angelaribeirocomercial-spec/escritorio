import { JudicialProcessRecord } from "@lexia/domain";

export const mockProcesses: readonly JudicialProcessRecord[] = [
  {
    id: "proc-101",
    caseId: "case-101",
    clientId: "cl-001",
    processNumber: "1008421-19.2026.8.26.0100",
    tribunal: "TJSP",
    courtDistrict: "Sao Paulo/SP",
    courtName: "12a Vara Civel do Foro Central",
    proceduralPhase: "Tutela e citacao inicial",
    status: "active",
    responsibleLawyer: "Dra. Helena Siqueira",
    monitoringMode: "court",
    latestTimeline: [
      {
        id: "proc-101-t1",
        occurredAt: "2026-04-02",
        title: "Distribuicao da acao",
        description:
          "Peticao inicial distribuida com pedido de revisao contratual e tutela para limitar cobranca.",
        source: "TJSP",
        criticality: "medium"
      },
      {
        id: "proc-101-t2",
        occurredAt: "2026-04-05",
        title: "Conclusos para apreciacao da tutela",
        description: "Magistrado recebeu os autos para analise do pedido liminar.",
        source: "TJSP",
        criticality: "high"
      },
      {
        id: "proc-101-t3",
        occurredAt: "2026-04-08",
        title: "Intimacao para complementar planilha",
        description:
          "Secretaria solicitou reforco da memoria de calculo contratual.",
        source: "TJSP",
        criticality: "medium"
      }
    ]
  },
  {
    id: "proc-205",
    caseId: "case-205",
    clientId: "cl-002",
    processNumber: "5011274-65.2026.8.19.0001",
    tribunal: "TJRJ",
    courtDistrict: "Rio de Janeiro/RJ",
    courtName: "7o Juizado Especial Civel da Capital",
    proceduralPhase: "Pre-protocolo estrategico",
    status: "awaiting-filing",
    responsibleLawyer: "Dr. Caio Nascimento",
    monitoringMode: "manual",
    latestTimeline: [
      {
        id: "proc-205-t1",
        occurredAt: "2026-04-01",
        title: "Checklist probatorio iniciado",
        description:
          "Equipe iniciou consolidacao dos comprovantes PIX e historico de atendimento bancario.",
        source: "ADVX",
        criticality: "medium"
      },
      {
        id: "proc-205-t2",
        occurredAt: "2026-04-06",
        title: "Boletim de ocorrencia pendente",
        description:
          "Sem o B.O., a estrategia segue aguardando validacao documental final.",
        source: "ADVX",
        criticality: "high"
      },
      {
        id: "proc-205-t3",
        occurredAt: "2026-04-09",
        title: "Rascunho inicial liberado",
        description:
          "Estrutura de fatos e dano moral preparada para protocolo assim que a prova faltante entrar.",
        source: "ADVX",
        criticality: "low"
      }
    ]
  },
  {
    id: "proc-311",
    caseId: "case-311",
    clientId: "cl-003",
    processNumber: "7012844-11.2026.8.13.0024",
    tribunal: "TJMG",
    courtDistrict: "Belo Horizonte/MG",
    courtName: "4a Vara Empresarial e Civel",
    proceduralPhase: "Inicial em revisao final",
    status: "monitoring",
    responsibleLawyer: "Dra. Julia Ramalho",
    monitoringMode: "oab",
    latestTimeline: [
      {
        id: "proc-311-t1",
        occurredAt: "2026-03-29",
        title: "Leitura economica consolidada",
        description:
          "Planilha de encargos validada com foco em capitalizacao mensal e CET.",
        source: "ADVX",
        criticality: "medium"
      },
      {
        id: "proc-311-t2",
        occurredAt: "2026-04-04",
        title: "Minuta encaminhada para revisao interna",
        description:
          "Peca inicial foi encaminhada para revisao da tese economica principal.",
        source: "ADVX",
        criticality: "low"
      },
      {
        id: "proc-311-t3",
        occurredAt: "2026-04-09",
        title: "Janela de protocolo aberta",
        description:
          "Caso pronto para ingresso apos ultima checagem de anexos empresariais.",
        source: "ADVX",
        criticality: "medium"
      }
    ]
  },
  {
    id: "proc-312",
    caseId: "case-312",
    clientId: "cl-003",
    processNumber: "7012855-49.2026.8.13.0024",
    tribunal: "TJMG",
    courtDistrict: "Belo Horizonte/MG",
    courtName: "3a Vara Civel de Belo Horizonte",
    proceduralPhase: "Suspensao da negativacao",
    status: "stayed",
    responsibleLawyer: "Dra. Julia Ramalho",
    monitoringMode: "court",
    latestTimeline: [
      {
        id: "proc-312-t1",
        occurredAt: "2026-03-27",
        title: "Tutela parcialmente apreciada",
        description:
          "Juizo indicou necessidade de complemento da prova de restricao indevida.",
        source: "TJMG",
        criticality: "high"
      },
      {
        id: "proc-312-t2",
        occurredAt: "2026-04-03",
        title: "Autos em carga para manifestacao",
        description:
          "Equipe separou comprovantes de negativacao e cobrancas correlatas.",
        source: "TJMG",
        criticality: "medium"
      },
      {
        id: "proc-312-t3",
        occurredAt: "2026-04-07",
        title: "Processo temporariamente suspenso",
        description:
          "Fluxo parado ate juntada de documento complementar exigido pelo juizo.",
        source: "TJMG",
        criticality: "medium"
      }
    ]
  }
];
